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
  public PLUGIN_VERSION = '5.0.5';

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
        this.reloadApp();
        break;
      default:
        // NOTE: default anything that doesn't explicitly match to background updates
        await this.reloadApp();
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

    const device_details = {
      binary_version: appInfo.bundleVersion,
      device_id: appInfo.device || null,
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
          url: checkDeviceResp.url,
          versionId: checkDeviceResp.snapshot
        };
        await this._savePrefs(prefs);
      }
      return checkDeviceResp;
    }

    throw new Error(`Error Status ${resp.status}: ${jsonResp ? jsonResp.error.message : await resp.text()}`);
  }

  async downloadUpdate(progress?: CallbackFunction<number>): Promise<boolean> {
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
      return true;
    }
    return false;
  }

  private _getManifestName(versionId: string) {
    return versionId + '-manifest.json';
  }

  private async _downloadFilesFromManifest(baseUrl: string, manifest: ManifestFileEntry[], progress?: CallbackFunction<number>) {
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
          progress(Math.floor((downloaded / size) * 50));
        }
        return;
      }

      // if it's 0 size file just create it
      if (file.size === 0) {
        // Update progress
        downloaded += file.size;
        if (progress) {
          progress(Math.floor((downloaded / size) * 50));
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
          progress(Math.floor((downloaded / size) * 50));
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
          progress(Math.floor(((downloaded / size) * 50) + 50));
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

  async extractUpdate(progress?: CallbackFunction<number>): Promise<boolean> {
    const prefs = this._savedPreferences;
    if (!prefs.availableUpdate || prefs.availableUpdate.state !== 'pending') {
      return false;
    }

    const versionId = prefs.availableUpdate.versionId;
    await this._cleanSnapshotDir(versionId);
    console.log('Cleaned version directory');

    await this._copyBaseAppDir(versionId);
    console.log('Copied base app resources');

    await this._copyManifestFiles(versionId, progress);
    console.log('Recreated app from manifest');

    prefs.availableUpdate.state = UpdateState.Ready;
    prefs.updates[prefs.availableUpdate.versionId] = prefs.availableUpdate;
    await this._savePrefs(prefs);
    await this.cleanupVersions();
    return true;
  }

  async hideSplash(): Promise<string> {
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

  async reloadApp(): Promise<boolean> {
    const prefs = this._savedPreferences;

    // Save the current update if it's ready
    if (prefs.availableUpdate && prefs.availableUpdate.state === UpdateState.Ready) {
      prefs.currentVersionId = prefs.availableUpdate.versionId;
      delete prefs.availableUpdate;
      await this._savePrefs(prefs);
    }

    // Is there a non-binary version deployed?
    if (prefs.currentVersionId) {
      // Are we already running the deployed version?
      if (await this._isRunningVersion(prefs.currentVersionId)) {
        console.log(`Already running version ${prefs.currentVersionId}`);
        await this._savePrefs(prefs);
        this.hideSplash();
        return false;
      }

      // Is the current version on the device?
      if (!(prefs.currentVersionId in prefs.updates)) {
        console.error(`Missing version ${prefs.currentVersionId}`);
        this.hideSplash();
        return false;
      }

      // Is the current version built from a previous binary?
      if (prefs.binaryVersion !== prefs.updates[prefs.currentVersionId].binaryVersion) {
        console.log(
          `Version ${prefs.currentVersionId} was built for binary version ` +
          `${prefs.updates[prefs.currentVersionId].binaryVersion}, but device is running ${prefs.binaryVersion}, ` +
          `rebuilding...`
        );

        await this._cleanSnapshotDir(prefs.currentVersionId);
        console.log('Cleaned version directory');
    
        await this._copyBaseAppDir(prefs.currentVersionId);
        console.log('Copied base app resources');
    
        await this._copyManifestFiles(prefs.currentVersionId);
        console.log('Recreated app from manifest\nSuccessfully rebuilt app!');
      }

      // Reload the webview
      const newLocation = new URL(this.getSnapshotCacheDir(prefs.currentVersionId));
      Ionic.WebView.setServerBasePath(newLocation.pathname);
      return true;
    }

    this.hideSplash();
    return false;
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

  private async _cleanSnapshotDir(versionId: string) {
    const snapshotDir = this.getSnapshotCacheDir(versionId);
    try {
      const dirEntry = await this._fileManager.getDirectory(snapshotDir, false);
      console.log(`directory found for snapshot ${versionId} deleting`);
      await (new Promise( (resolve, reject) => dirEntry.removeRecursively(resolve, reject)));
    } catch (e) {
      console.log('No directory found for snapshot no need to delete');
    }
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

  private async _copyManifestFiles(versionId: string, progress?: CallbackFunction<number>) {
    const snapshotDir = this.getSnapshotCacheDir(versionId);
    const manifest = await this.readManifest(versionId);
    let size = 0, extracted = 0;
    manifest.forEach(i => {
      size += i.size;
    });
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
          progress(Math.floor((extracted / size) * 100));
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
  }

  async getCurrentVersion(): Promise<ISnapshotInfo | undefined> {
    const versionId = this._savedPreferences.currentVersionId;
    if (typeof versionId === 'string') {
      return this.getVersionById(versionId);
    }
    return;
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

  async deleteVersionById(versionId: string): Promise<boolean> {
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

    return true;
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

  async sync(syncOptions: ISyncOptions = {}): Promise<ISnapshotInfo | undefined> {
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

    if (prefs.currentVersionId) {
      return {
        deploy_uuid: prefs.currentVersionId,
        versionId: prefs.currentVersionId,
        channel: prefs.channel,
        binary_version: prefs.binaryVersion,
        binaryVersion: prefs.binaryVersion
      };
    }
    return;
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
  private fetchIsAvailable: boolean;
  private lastPause = 0;
  private minBackgroundDuration = 10;
  private _platformIsReady: Promise<undefined>;

  constructor(parent: IPluginBaseAPI) {
    this.parent = parent;
    this.delegate = this.initialize();
    this.fetchIsAvailable = typeof(fetch) === 'function';
    this._platformIsReady = this.platformReady();
    document.addEventListener('deviceready', this.onLoad.bind(this));
  }

  async initialize() {
    await this.platformReady();
    const preferences = await this._initPreferences();
    this.minBackgroundDuration = preferences.minBackgroundDuration;
    const appInfo = await this.parent.getAppDetails();
    const delegate = new IonicDeployImpl(appInfo, preferences);
    // Only initialize start the plugin if fetch is available
    if (!this.fetchIsAvailable) {
      console.warn('Fetch is unavailable so cordova-plugin-ionic has been disabled.');
      await (await this.delegate).hideSplash();
    } else {
      await delegate._handleInitialPreferenceState();
    }
    return delegate;
  }

  private async platformReady(): Promise<undefined> {
    if (!this._platformIsReady) {
      return new Promise<undefined>((resolve, reject) => {
        if (window.cordova) {
          document.addEventListener('deviceready', () => {
            resolve();
          });
        } else {
          reject();
        }
      });
    }
    return this._platformIsReady;
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
    if (this.fetchIsAvailable && this.lastPause && this.minBackgroundDuration && Date.now() - this.lastPause > this.minBackgroundDuration * 1000) {
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

  async checkForUpdate(): Promise<CheckDeviceResponse> {
    await this.platformReady();
    if (this.fetchIsAvailable) {
      return (await this.delegate).checkForUpdate();
    }
    return  {available: false};
  }

  async configure(config: IDeployConfig): Promise<void> {
    await this.platformReady();
    if (this.fetchIsAvailable) return (await this.delegate).configure(config);
  }

  async getConfiguration(): Promise<ICurrentConfig> {
    await this.platformReady();
    return new Promise<ICurrentConfig>(async (resolve, reject) => {
      try {
        cordova.exec(async (prefs: ISavedPreferences) => {
          if (prefs.availableUpdate) {
            delete prefs.availableUpdate;
          }
          if (prefs.updates) {
            delete prefs.updates;
          }
          resolve(prefs);
        }, reject, 'IonicCordovaCommon', 'getPreferences');
      } catch (e) {
        reject(e.message);
      }
    });
  }

  async deleteVersionById(version: string): Promise<boolean> {
    await this.platformReady();
    if (this.fetchIsAvailable) return (await this.delegate).deleteVersionById(version);
    return true;
  }

  async downloadUpdate(progress?: CallbackFunction<number>): Promise<boolean> {
    await this.platformReady();
    if (this.fetchIsAvailable) return (await this.delegate).downloadUpdate(progress);
    return false;
  }

  async extractUpdate(progress?: CallbackFunction<number>): Promise<boolean> {
    await this.platformReady();
    if (this.fetchIsAvailable) return (await this.delegate).extractUpdate(progress);
    return false;
  }

  async getAvailableVersions(): Promise<ISnapshotInfo[]> {
    await this.platformReady();
    if (this.fetchIsAvailable) return (await this.delegate).getAvailableVersions();
    return [];
  }

  async getCurrentVersion(): Promise<ISnapshotInfo | undefined> {
    await this.platformReady();
    if (this.fetchIsAvailable) return (await this.delegate).getCurrentVersion();
    return;
  }

  async getVersionById(versionId: string): Promise<ISnapshotInfo> {
    await this.platformReady();
    if (this.fetchIsAvailable) return (await this.delegate).getVersionById(versionId);
    throw Error(`No update available with versionId ${versionId}`);
  }

  async reloadApp(): Promise<boolean> {
    await this.platformReady();
    if (this.fetchIsAvailable) return (await this.delegate).reloadApp();
    return false;
  }

  async sync(syncOptions: ISyncOptions = {}): Promise<ISnapshotInfo | undefined> {
    await this.platformReady();
    if (this.fetchIsAvailable) return (await this.delegate).sync(syncOptions);
    return;
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
