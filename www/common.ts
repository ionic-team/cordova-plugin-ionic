/// <reference path="../types/IonicCordova.d.ts" />
/// <reference types="cordova-plugin-file" />
/// <reference types="cordova" />

declare const cordova: Cordova;
declare const resolveLocalFileSystemURL: Window['resolveLocalFileSystemURL'] ;
declare const Ionic: any;

enum UpdateMethod {
  BACKGROUND = 'background',
  AUTO = 'auto',
  NONE = 'none',
}

enum UpdateState {
  Available = 'available',
  Pending = 'pending',
  Ready = 'ready',
}

import {
  FetchManifestResp, IAvailableUpdate,
  ISavedPreferences,
  ISyncOptions,
  ManifestFileEntry,
} from './definitions';

import {
  isPluginConfig
} from './guards';


class Path {
    join(...paths: string[]): string {
        let fullPath: string = paths.shift() || '';
        for (const path of paths) {
            if (fullPath && fullPath.slice(-1) !== '/') {
                fullPath += '/';
            }
            fullPath = path.slice(0, 1) !== '/' ? fullPath + path : fullPath + path.slice(1);
        }
        return fullPath;
    }

}
const path = new Path();

/**
 * LIVE UPDATE API
 *
 * The plugin API for the live updates feature.
 */

class IonicDeployImpl {

  private readonly appInfo: IAppInfo;
  private _savedPreferences: ISavedPreferences;
  private _fileManager: FileManager = new FileManager();
  public FILE_CACHE = 'ionic_snapshot_files';
  public MANIFEST_CACHE = 'ionic_manifests';
  public SNAPSHOT_CACHE = 'ionic_built_snapshots';
  // TODO: It would be nice to have this update automagically when we do a version bump
  public PLUGIN_VERSION = '5.0.0';
  public NO_VERSION_DEPLOYED = 'none';
  public UNKNOWN_BINARY_VERSION = 'unknown';

  constructor(appInfo: IAppInfo, preferences: ISavedPreferences) {
    this.appInfo = appInfo;
    this._savedPreferences = preferences;
  }

  async _handleInitialPreferenceState() {
    const updateMethod = this._savedPreferences.updateMethod;
    switch (updateMethod) {
      case UpdateMethod.AUTO:
        // NOTE: call sync with background as override to avoid sync
        // reloading the app and manually reload always once sync has
        // set the correct currentVersionId
        console.log('calling _sync');
        await this.sync({updateMethod: UpdateMethod.BACKGROUND});
        console.log('calling _reload');
        await this.reloadApp();
        console.log('done _reloading');
        break;
      case UpdateMethod.NONE:
        this.hideSplash();
        break;
      default:
        // NOTE: default anything that doesn't explicitly match to background updates
        if (this._savedPreferences.currentVersionId) {
          this.reloadApp();
        } else {
          this.hideSplash();
        }
        this.sync({updateMethod: UpdateMethod.BACKGROUND});
        return;
    }
  }

  getFileCacheDir(): string {
    return path.join(cordova.file.cacheDirectory, this.FILE_CACHE);
  }

  getManifestCacheDir(): string {
    return path.join(cordova.file.dataDirectory, this.MANIFEST_CACHE);
  }

  getSnapshotCacheDir(versionId: string): string {
    return path.join(cordova.file.dataDirectory, this.SNAPSHOT_CACHE, versionId);
  }

  private async _syncPrefs(prefs: ISavedPreferences) {
    const appInfo = this.appInfo;
    const currentPrefs = this._savedPreferences;
    if (currentPrefs) {
      currentPrefs.binaryVersion = appInfo.bundleVersion;
      Object.assign(currentPrefs, prefs);
    }
    return this._savePrefs(currentPrefs);
  }

  private async _savePrefs(prefs: ISavedPreferences): Promise<ISavedPreferences> {
    return new Promise<ISavedPreferences>(async (resolve, reject) => {
      try {
        cordova.exec(async (savedPrefs: ISavedPreferences) => {
          resolve(savedPrefs);
        }, reject, 'IonicCordovaCommon', 'setPreferences', [prefs]);
      } catch (e) {
        reject(e.message);
      }
    });
  }

  async configure(config: IDeployConfig) {
    if (!isPluginConfig(config)) {
      throw new Error('Invalid Config Object');
    }
    Object.assign(this._savedPreferences, config);
    await this._syncPrefs(this._savedPreferences);
  }

  async checkForUpdate(): Promise<CheckDeviceResponse> {
    const prefs = this._savedPreferences;
    const appInfo = this.appInfo;
    const endpoint = `${prefs.host}/apps/${prefs.appId}/channels/check-device`;

    // TODO: Need to send UUID device details for unique device metrics
    const device_details = {
      binary_version: appInfo.bundleVersion,
      device_id: appInfo.device,
      platform: appInfo.platform,
      platform_version: appInfo.platformVersion,
      snapshot: prefs.currentVersionId
    };
    const body = {
      channel_name: prefs.channel,
      app_id: prefs.appId,
      device: device_details,
      plugin_version: this.PLUGIN_VERSION,
      manifest: true
    };

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(body)
    });

    let jsonResp;
    if (resp.status < 500) {
      jsonResp = await resp.json();
    }
    if (resp.ok) {
      const checkDeviceResp: CheckDeviceResponse = jsonResp.data;
      if (checkDeviceResp.available && checkDeviceResp.url && checkDeviceResp.snapshot) {
        prefs.availableUpdate = {
          binaryVersion: appInfo.bundleVersion,
          channel: prefs.channel,
          state: UpdateState.Available,
          lastUsed: new Date().toISOString(),
          path: this.getSnapshotCacheDir(checkDeviceResp.snapshot),
          url: checkDeviceResp.url,
          versionId: checkDeviceResp.snapshot
        };
        await this._savePrefs(prefs);
      }
      return checkDeviceResp;
    }

    throw new Error(`Error Status ${resp.status}: ${jsonResp ? jsonResp.error.message : await resp.text()}`);
  }

  async downloadUpdate(progress?: CallbackFunction<string>): Promise<string> {
    const prefs = this._savedPreferences;
    if (prefs.availableUpdate && prefs.availableUpdate.state === UpdateState.Available) {
      const { manifestBlob, fileBaseUrl } = await this._fetchManifest(prefs.availableUpdate.url);
      const manifestString = await this._fileManager.getFile(
        this.getManifestCacheDir(),
        this._getManifestName(prefs.availableUpdate.versionId),
        true,
        manifestBlob
      );
      const manifestJson = JSON.parse(manifestString);
      await this._downloadFilesFromManifest(fileBaseUrl, manifestJson, progress);
      prefs.availableUpdate.state = UpdateState.Pending;
      await this._savePrefs(prefs);
      return 'true';
    }
    throw new Error('No available updates');
  }

  private _getManifestName(versionId: string) {
    return versionId + '-manifest.json';
  }

  private async _downloadFilesFromManifest(baseUrl: string, manifest: ManifestFileEntry[], progress?: CallbackFunction<string>) {
    console.log('Downloading update...');
    let size = 0, downloaded = 0;
    manifest.forEach(i => {
      size += i.size;
    });

    const downloads = await Promise.all(manifest.map( async file => {
      const alreadyExists = await this._fileManager.fileExists(
        this.getFileCacheDir(),
        this._cleanHash(file.integrity)
      );
      if (alreadyExists) {
        console.log(`file ${file.href} with size ${file.size} already exists`);

        // Update progress
        downloaded += file.size;
        if (progress) {
          progress(Math.floor((downloaded / size) * 50).toString());
        }
        return;
      }

      // if it's 0 size file just create it
      if (file.size === 0) {
        // Update progress
        downloaded += file.size;
        if (progress) {
          progress(Math.floor((downloaded / size) * 50).toString());
        }

        return {
          hash: this._cleanHash(file.integrity),
          blob: new Blob()
        };
      }

      // otherwise get it from internets
      const base = new URL(baseUrl);
      const newUrl = new URL(file.href, baseUrl);
      newUrl.search = base.search;
      return fetch( newUrl.toString(), {
        method: 'GET',
        integrity: file.integrity,
      }).then( async (resp: Response) => {
        // Update progress
        downloaded += file.size;
        if (progress) {
          progress(Math.floor((downloaded / size) * 50).toString());
        }

        return {
          hash: this._cleanHash(file.integrity),
          blob: await resp.blob()
        };
      });
    }));

    const now = new Date();
    downloaded = 0;

    for (const download of downloads) {
      if (download) {
        await this._fileManager.getFile(
          this.getFileCacheDir(),
          download.hash,
          true,
          download.blob
        );

        // Update progress
        downloaded += download.blob.size;
        if (progress) {
          progress(Math.floor(((downloaded / size) * 50) + 50).toString());
        }
      }
    }

    console.log(`Wrote files in ${(new Date().getTime() - now.getTime()) / 1000} seconds.`);
  }

  private _cleanHash(metadata: string): string {
    const hashes = metadata.split(' ');
    return hashes[0].replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  private async _fetchManifest(url: string): Promise<FetchManifestResp> {
    const resp = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
    });
    return {
      manifestBlob: await resp.blob(),
      fileBaseUrl: resp.url
    };
  }

  async extractUpdate(progress?: CallbackFunction<string>): Promise<string> {
    const prefs = this._savedPreferences;
    if (!prefs.availableUpdate || prefs.availableUpdate.state !== 'pending') {
      throw new Error('No pending update to extract');
    }
    const versionId = prefs.availableUpdate.versionId;
    const manifest = await this.readManifest(versionId);
    let size = 0, extracted = 0;
    manifest.forEach(i => {
      size += i.size;
    });
    const snapshotDir = this.getSnapshotCacheDir(versionId);
    try {
      const dirEntry = await this._fileManager.getDirectory(snapshotDir, false);
      console.log(`directory found for snapshot ${versionId} deleting`);
      await (new Promise( (resolve, reject) => dirEntry.removeRecursively(resolve, reject)));
    } catch (e) {
      console.log('No directory found for snapshot no need to delete');
    }

    await this._copyBaseAppDir(versionId);
    console.log('Successful Swizzle');
    await Promise.all(manifest.map( async (file: ManifestFileEntry) => {
      const splitPath = file.href.split('/');
      const fileName = splitPath.pop();
      let path;
      if (splitPath.length > 0) {
        path = splitPath.join('/');
      }
      path =  snapshotDir + (path ? ('/' + path) : '');
      if (fileName) {
        try {
          await this._fileManager.removeFile(path, fileName);
        } catch (e) {
          console.log(`New file ${path}/${fileName}`);
        }

        // Update progress
        extracted += file.size;
        if (progress) {
          progress(Math.floor((extracted / size) * 100).toString());
        }
        return this._fileManager.copyTo(
          this.getFileCacheDir(),
          this._cleanHash(file.integrity),
          path,
          fileName
        );
      }
      throw new Error('No file name found');
    }));
    console.log('Successful recreate');
    prefs.availableUpdate.state = UpdateState.Ready;
    prefs.updates[prefs.availableUpdate.versionId] = prefs.availableUpdate;
    await this._savePrefs(prefs);
    await this.cleanupVersions();
    return 'true';
  }

  private async hideSplash(): Promise<string> {
    return new Promise<string>( (resolve, reject) => {
      cordova.exec(resolve, reject, 'IonicCordovaCommon', 'clearSplashFlag');
    });
  }

  private async readManifest(versionId: string): Promise<ManifestFileEntry[]> {
    const manifestString = await this._fileManager.getFile(
      this.getManifestCacheDir(),
      this._getManifestName(versionId)
    );
    return JSON.parse(manifestString);
  }

  async reloadApp(): Promise<string> {
    const prefs = this._savedPreferences;
    if (prefs.availableUpdate && prefs.availableUpdate.state === UpdateState.Ready) {
      prefs.currentVersionId = prefs.availableUpdate.versionId;
      delete prefs.availableUpdate;
      await this._savePrefs(prefs);
    }
    if (prefs.currentVersionId) {
      if (await this._isRunningVersion(prefs.currentVersionId)) {
        console.log(`Already running version ${prefs.currentVersionId}`);
        await this._savePrefs(prefs);
        this.hideSplash();
        return 'true';
      }
      if (!(prefs.currentVersionId in prefs.updates)) {
        console.error(`Missing version ${prefs.currentVersionId}`);
        return 'false';
      }
      const update = prefs.updates[prefs.currentVersionId];
      const newLocation = new URL(update.path);
      Ionic.WebView.setServerBasePath(newLocation.pathname);
    }

    return 'true';
  }

  private async _isRunningVersion(versionId: string) {
    const currentPath = await this._getServerBasePath();
    console.log(`fetched current base path as ${currentPath}`);
    return currentPath.includes(versionId);
  }

  private async _getServerBasePath(): Promise<string> {
    return new Promise<string>( async (resolve, reject) => {
      try {
        Ionic.WebView.getServerBasePath(resolve);
      } catch (e) {
       reject(e);
      }
    });
  }

  private async _copyBaseAppDir(versionId: string) {
    return new Promise( async (resolve, reject) => {
      try {
        const rootAppDirEntry = await this._fileManager.getDirectory(`${cordova.file.applicationDirectory}/www`, false);
        const snapshotCacheDirEntry = await this._fileManager.getDirectory(this.getSnapshotCacheDir(''), true);
        console.log(snapshotCacheDirEntry);
        rootAppDirEntry.copyTo(snapshotCacheDirEntry, versionId, resolve, reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  async getCurrentVersion(): Promise<ISnapshotInfo> {
    const versionId = this._savedPreferences.currentVersionId;
    if (typeof versionId === 'string') {
      return this.getVersionById(versionId);
    }
    throw new Error('No current version applied.');
  }

  async getVersionById(versionId: string): Promise<ISnapshotInfo> {
    const update = this._savedPreferences.updates[versionId];
    if (!update) {
      throw Error(`No update available with versionId ${versionId}`);
    }
    return this._convertToSnapshotInfo(update);
  }

  private _convertToSnapshotInfo(update: IAvailableUpdate): ISnapshotInfo {
    return {
      deploy_uuid: update.versionId,
      versionId: update.versionId,
      channel: update.channel,
      binary_version: update.binaryVersion,
      binaryVersion: update.binaryVersion
    };
  }

  async getAvailableVersions(): Promise<ISnapshotInfo[]> {
    return Object.keys(this._savedPreferences.updates).map(k => this._convertToSnapshotInfo(this._savedPreferences.updates[k]));
  }

  async deleteVersionById(versionId: string): Promise<string> {
    const prefs = this._savedPreferences;

    if (prefs.currentVersionId === versionId) {
      throw Error(`Can't delete version with id: ${versionId} as it is the current version.`);
    }

    delete prefs.updates[versionId];
    await this._savePrefs(prefs);

    // delete snapshot directory
    const snapshotDir = this.getSnapshotCacheDir(versionId);
    const dirEntry = await this._fileManager.getDirectory(snapshotDir, false);
    console.log(`directory found for snapshot ${versionId} deleting`);
    await (new Promise((resolve, reject) => dirEntry.removeRecursively(resolve, reject)));

    // delete manifest
    const manifestFile = await this._fileManager.getFileEntry(
      this.getManifestCacheDir(),
      this._getManifestName(versionId)
    );
    await new Promise((resolve, reject) => manifestFile.remove(resolve, reject));

    // cleanup file cache
    await this.cleanupCache();

    return 'true';
  }

  private async cleanupCache() {
    const prefs = this._savedPreferences;

    const hashes = new Set<string>();
    for (const versionId of Object.keys(prefs.updates)) {
      for (const entry of await this.readManifest(versionId)) {
        hashes.add(this._cleanHash(entry.integrity));
      }
    }

    const fileDir = this.getFileCacheDir();
    const cacheDirEntry = await this._fileManager.getDirectory(fileDir, false);
    const reader = cacheDirEntry.createReader();
    const entries = await new Promise<Entry[]>((resolve, reject) => reader.readEntries(resolve, reject));
    for (const entry of entries) {
      if (hashes.has(entry.name) || !entry.isFile) {
        continue;
      }
      await new Promise((resolve, reject) => entry.remove(resolve, reject));
    }
  }

  private async cleanupVersions() {
    const prefs = this._savedPreferences;

    let updates = [];
    for (const versionId of Object.keys(prefs.updates)) {
      updates.push(prefs.updates[versionId]);
    }

    updates = updates.sort((a, b) => a.lastUsed.localeCompare(b.lastUsed));
    updates = updates.reverse();
    updates = updates.slice(prefs.maxVersions);

    for (const update of updates) {
      await this.deleteVersionById(update.versionId);
    }
  }

  async sync(syncOptions: ISyncOptions = {}): Promise<ISnapshotInfo> {
    const prefs = this._savedPreferences;

    // TODO: Get API override if present?
    const updateMethod = syncOptions.updateMethod || prefs.updateMethod;

    await this.checkForUpdate();

    if (prefs.availableUpdate) {
      if (prefs.availableUpdate.state === UpdateState.Available) {
        await this.downloadUpdate();
      }
      if (prefs.availableUpdate.state === UpdateState.Pending) {
        await this.extractUpdate();
      }
      if (prefs.availableUpdate.state === UpdateState.Ready && updateMethod === UpdateMethod.AUTO) {
        await this.reloadApp();
      }
    }

    return {
      deploy_uuid: prefs.currentVersionId || this.NO_VERSION_DEPLOYED,
      versionId: prefs.currentVersionId || this.NO_VERSION_DEPLOYED,
      channel: prefs.channel,
      binary_version: prefs.binaryVersion || this.UNKNOWN_BINARY_VERSION,
      binaryVersion: prefs.binaryVersion || this.UNKNOWN_BINARY_VERSION
    };
  }
}

class FileManager {

  async getDirectory(path: string, createDirectory = true): Promise<DirectoryEntry> {
    return new Promise<DirectoryEntry>((resolve, reject) => {
      resolveLocalFileSystemURL(
        path,
        entry => entry.isDirectory ? resolve(entry as DirectoryEntry) : reject(),
        async () => {
          const components = path.split('/');
          const child = components.pop() as string;
          try {
            const parent = (await this.getDirectory(components.join('/'), createDirectory)) as DirectoryEntry;
            parent.getDirectory(child, { create: createDirectory }, async entry => {
              if (entry.fullPath === path) {
                resolve(entry);
              } else {
                resolve(await this.getDirectory(path, createDirectory));
              }
            }, reject);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  }

  async resolvePath(): Promise<DirectoryEntry> {
    return new Promise<DirectoryEntry>( (resolve, reject) => {
      resolveLocalFileSystemURL(cordova.file.dataDirectory, (rootDirEntry: Entry) => {
        resolve(rootDirEntry as DirectoryEntry);
      }, reject);
    });
  }

  async readFile(fileEntry: FileEntry): Promise<string> {

    return new Promise<string>( (resolve, reject) => {
      fileEntry.file( (file) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          resolve(reader.result as string);
        };

        reader.readAsText(file);
      }, reject);
    });
  }

  async getFile(path: string, fileName: string, createFile = false, dataBlob?: Blob): Promise<string> {
    const fileEntry = await this.getFileEntry(path, fileName, createFile, dataBlob);
    return this.readFile(fileEntry);
  }

  async getFileEntry(path: string, fileName: string, createFile = false, dataBlob?: Blob) {
    if (createFile && !dataBlob) {
      throw new Error('Must provide file blob if createFile is true');
    }
    const dirEntry = await this.getDirectory(path, createFile);
    return new Promise<FileEntry>( (resolve, reject) => {
      if (createFile && dataBlob) {
        dirEntry.getFile(fileName + '.tmp.' + Date.now(), {create: true, exclusive: false}, async (fileEntry: FileEntry) => {
            await this.writeFile(fileEntry, dataBlob);
            fileEntry.moveTo(dirEntry, fileName, entry => resolve(entry as FileEntry), reject);
          }, reject);
      } else {
        dirEntry.getFile(fileName, {create: createFile, exclusive: false}, resolve, reject);
      }
    });
  }

  async fileExists(path: string, fileName: string) {
    try {
      await this.getFileEntry(path, fileName);
      return true;
    } catch (e) {
      return false;
    }
  }

  async copyTo(oldPath: string, oldFileName: string, newPath: string, newFileName: string) {
    const fileEntry = await this.getFileEntry(oldPath, oldFileName);
    const newDirEntry = await this.getDirectory(newPath);
    return new Promise( (resolve, reject) => {
      fileEntry.copyTo(newDirEntry, newFileName, resolve, reject);
    });
  }

  async removeFile(path: string, filename: string) {
    const fileEntry = await this.getFileEntry(path, filename);
    return new Promise( (resolve, reject) => {
      fileEntry.remove(resolve, reject);
    });
  }

  async writeFile(fileEntry: FileEntry, dataBlob: Blob) {
    return new Promise( (resolve, reject) => {
      fileEntry.createWriter( (fileWriter: FileWriter) => {

        const status = {done: 0};
        let chunks = 1;
        let offset = Math.floor(dataBlob.size / chunks);

        // Maximum chunk size 512kb
        while (offset > (1024 * 512)) {
          chunks *= 2;
          offset = Math.floor(dataBlob.size / chunks);
        }

        fileWriter.onwriteend = (file) => {
          status.done += 1;
          if (status.done === chunks) {
            resolve();
          } else {
            fileWriter.seek(fileWriter.length);
            fileWriter.write(dataBlob.slice(status.done * offset, (status.done * offset) + offset));
          }
        };

        fileWriter.onerror = (e: ProgressEvent) => {
          reject(e.toString());
        };

        fileWriter.write(dataBlob.slice(0, offset));
      });
    });
  }

}

class IonicDeploy implements IDeployPluginAPI {
  private parent: IPluginBaseAPI;
  private delegate: Promise<IonicDeployImpl>;
  private lastPause = 0;
  private minBackgroundDuration = 10;

  constructor(parent: IPluginBaseAPI) {
    this.parent = parent;
    this.delegate = this.initialize();
    document.addEventListener('deviceready', this.onLoad.bind(this));
  }

  async initialize() {
    const preferences = await this._initPreferences();
    this.minBackgroundDuration = preferences.minBackgroundDuration;
    const appInfo = await this.parent.getAppDetails();
    const delegate = new IonicDeployImpl(appInfo, preferences);
    await delegate._handleInitialPreferenceState();
    return delegate;
  }

  async onLoad() {
    document.addEventListener('pause', this.onPause.bind(this));
    document.addEventListener('resume', this.onResume.bind(this));
    await this.onResume();
  }

  async onPause() {
    this.lastPause = Date.now();
  }

  async onResume() {
    if (this.lastPause && this.minBackgroundDuration && Date.now() - this.lastPause > this.minBackgroundDuration * 1000) {
      await (await this.delegate).sync();
      await this.reloadApp();
    }
  }

  async _initPreferences(): Promise<ISavedPreferences> {
    return new Promise<ISavedPreferences>(async (resolve, reject) => {
      try {
        cordova.exec(async (prefs: ISavedPreferences) => {
          resolve(prefs);
        }, reject, 'IonicCordovaCommon', 'getPreferences');
      } catch (e) {
        reject(e.message);
      }
    });
  }

  /* v4 API */

  init(config: IDeployConfig, success: CallbackFunction<void>, failure: CallbackFunction<string>): void {
    console.warn('This function has been deprecated in favor of IonicCordova.deploy.configure.');
    this.configure(config).then(
      result => success(),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  check(success: CallbackFunction<string>, failure: CallbackFunction<string>): void {
    console.warn('This function has been deprecated in favor of IonicCordova.deploy.checkForUpdate.');
    this.checkForUpdate().then(
      result => success(String(result.available)),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  download(success: CallbackFunction<string>, failure: CallbackFunction<string>): void {
    console.warn('This function has been deprecated in favor of IonicCordova.deploy.downloadUpdate.');
    this.downloadUpdate(success).then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  extract(success: CallbackFunction<string>, failure: CallbackFunction<string>): void {
    console.warn('This function has been deprecated in favor of IonicCordova.deploy.extractUpdate.');
    this.extractUpdate(success).then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  redirect(success: CallbackFunction<string>, failure: CallbackFunction<string>): void {
    console.warn('This function has been deprecated in favor of IonicCordova.deploy.reloadApp.');
    this.reloadApp().then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  info(success: CallbackFunction<ISnapshotInfo>, failure: CallbackFunction<string>): void {
    console.warn('This function has been deprecated in favor of IonicCordova.deploy.getCurrentVersion.');
    this.getCurrentVersion().then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  getVersions(success: CallbackFunction<string[]>, failure: CallbackFunction<string>): void {
    console.warn('This function has been deprecated in favor of IonicCordova.deploy.getAvailableVersions.');
    this.getAvailableVersions().then(
      results => success(results.map(result => result.versionId)),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  deleteVersion(version: string, success: CallbackFunction<string>, failure: CallbackFunction<string>): void {
    console.warn('This function has been deprecated in favor of IonicCordova.deploy.deleteVersionById.');
    this.deleteVersionById(version).then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  /* v5 API */

  async checkForUpdate(): Promise<CheckDeviceResponse> {
    return (await this.delegate).checkForUpdate();
  }

  async configure(config: IDeployConfig): Promise<void> {
    return (await this.delegate).configure(config);
  }

  async deleteVersionById(version: string): Promise<string> {
    return (await this.delegate).deleteVersionById(version);
  }

  async downloadUpdate(progress?: CallbackFunction<string>): Promise<string> {
    return (await this.delegate).downloadUpdate(progress);
  }

  async extractUpdate(progress?: CallbackFunction<string>): Promise<string> {
    return (await this.delegate).extractUpdate(progress);
  }

  async getAvailableVersions(): Promise<ISnapshotInfo[]> {
    return (await this.delegate).getAvailableVersions();
  }

  async getCurrentVersion(): Promise<ISnapshotInfo> {
    return (await this.delegate).getCurrentVersion();
  }

  async getVersionById(versionId: string): Promise<ISnapshotInfo> {
    return (await this.delegate).getVersionById(versionId);
  }

  async reloadApp(): Promise<string> {
    return (await this.delegate).reloadApp();
  }
}


/**
 * BASE API
 *
 * All features of the Ionic Cordova plugin are registered here, along with some low level error tracking features used
 * by the monitoring service.
 */
class IonicCordova implements IPluginBaseAPI {

  public deploy: IDeployPluginAPI;

  constructor() {
      this.deploy = new IonicDeploy(this);
      this.deploy.getAvailableVersions();
  }


  getAppInfo(success: CallbackFunction<IAppInfo>, failure: CallbackFunction<string>) {
    console.warn('This function has been deprecated in favor of IonicCordova.getAppDetails.');
    this.getAppDetails().then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  async getAppDetails(): Promise<IAppInfo> {
    return new Promise<IAppInfo>( (resolve, reject) => {
      cordova.exec(resolve, reject, 'IonicCordovaCommon', 'getAppInfo');
    });
  }
}

const instance = new IonicCordova();
export = instance;
