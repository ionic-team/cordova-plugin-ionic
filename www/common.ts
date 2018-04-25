/// <reference types="cordova-plugin-file" />
/// <reference types="cordova" />

declare const cordova: Cordova;
declare const resolveLocalFileSystemURL: Window['resolveLocalFileSystemURL'] ;

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
  CallbackFunction,
  CheckDeviceResponse,
  FetchManifestResp,
  IAppInfo,
  IDeployConfig,
  IDeployPluginV4,
  IDeployPluginV5,
  INativePreferences,
  IPluginBaseAPI,
  ISavedPreferences,
  ISnapshotInfo,
  ISyncOptions,
  ManifestFileEntry,
} from './definitions';

import {
  isPluginConfig
} from './guards';

// NATIVE API TODO:
// getPreferences
// syncPreferences


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

class IonicDeployV5 implements IDeployPluginV5 {

  private _savedPreferences: Promise<ISavedPreferences>;
  private _parent: IPluginBaseAPI;
  private _PREFS_KEY = '_ionicDeploySavedPrefs';
  private _fileManager: FileManager = new FileManager();
  public FILE_CACHE = 'ionic_snapshot_files';
  public MANIFEST_CACHE = 'ionic_manifests';
  public SNAPSHOT_CACHE = 'ionic_built_snapshots';
  public PLUGIN_VERSION = '5.0.0';
  public NO_VERSION_DEPLOYED = 'none';
  public UNKNOWN_BINARY_VERSION = 'unknown';

  constructor(parent: IPluginBaseAPI) {
    this._parent = parent;
    document.addEventListener('deviceready', this.onLoad.bind(this));
  }

  onLoad() {
    document.addEventListener('resume', this.onResume.bind(this));
    this.onResume();
  }

  onResume() {
    this._savedPreferences = this._initPreferences();
    this._savedPreferences.then(this._syncPrefs.bind(this), console.error).then(this._reloadApp.bind(this));
  }

  async _handleInitialPreferenceState(prefs: ISavedPreferences) {
    const updateMethod = prefs.updateMethod;
    switch (updateMethod) {
      case UpdateMethod.AUTO:
        // NOTE: call sync with background as override to avoid sync
        // reloading the app and manually reload always once sync has
        // set the correct currentVersionId
        console.log('calling _sync');
        await this._sync(prefs, {updateMethod: UpdateMethod.BACKGROUND});
        console.log('calling _reload');
        await this._reloadApp(prefs);
        console.log('done _reloading');
        break;
      case UpdateMethod.NONE:
        // TODO: nothing? maybe later to recover from borked updated we may want to checkForUpdate
        // and allow api to override
        break;
      default:
        // NOTE: default anything that doesn't explicitly match to background updates
        if (prefs.currentVersionId) {
          this._reloadApp(prefs);
        }
        this._sync(prefs, {updateMethod: UpdateMethod.BACKGROUND});
        return;
    }
  }

  async _initPreferences(): Promise<ISavedPreferences> {
    return new Promise<ISavedPreferences>(async (resolve, reject) => {
      try {
        const prefsString = localStorage.getItem(this._PREFS_KEY);
        if (!prefsString) {
          cordova.exec(async (nativePrefs: INativePreferences) => {
            const prefs: ISavedPreferences = {...nativePrefs, updates: {}};
            console.log('got prefs from native');
            await this._handleInitialPreferenceState(prefs);
            console.log('done handling init');
            resolve(prefs);
          }, reject, 'IonicCordovaCommon', 'getPreferences');
        } else {
          const savedPreferences = JSON.parse(prefsString);
          console.log('got prefs from storage');
          await this._handleInitialPreferenceState(savedPreferences);
          resolve(savedPreferences);
        }
      } catch (e) {
        reject(e.message);
      }
    });
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
    const appInfo = await this._parent.getAppDetails();
    const currentPrefs = await this._savedPreferences;
    if (currentPrefs) {
      currentPrefs.binaryVersion = appInfo.bundleVersion;
      Object.assign(currentPrefs, prefs);
    }
    return this._savePrefs(currentPrefs);
  }

  private _savePrefs(prefs: ISavedPreferences) {
    localStorage.setItem(this._PREFS_KEY, JSON.stringify(prefs));
    return prefs;
  }

  async configure(config: IDeployConfig) {
    if (!isPluginConfig(config)) {
      throw new Error('Invalid Config Object');
    }
    // TODO: make sure the user can't overwrite protected things
    Object.assign(await this._savedPreferences, config);
    return new Promise( async (resolve, reject) => {
      this._syncPrefs(await this._savedPreferences);
    });
  }

  async checkForUpdate(): Promise<CheckDeviceResponse> {
    const prefs = await this._savedPreferences;
    return this._checkForUpdate(prefs);
  }

  private async _checkForUpdate(prefs: ISavedPreferences): Promise<CheckDeviceResponse> {
    const appInfo = await this._parent.getAppDetails();
    const endpoint = `${prefs.host}/apps/${prefs.appId}/channels/check-device`;
    const device_details = {
      binary_version: appInfo.bundleVersion,
      platform: appInfo.platform,
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
      console.log('CHECK RESP', checkDeviceResp);
      if (checkDeviceResp.available && checkDeviceResp.url && checkDeviceResp.snapshot) {
        prefs.availableUpdate = {
          binaryVersion: appInfo.bundleVersion,
          channel: prefs.channel,
          state: UpdateState.Available,
          path: this.getSnapshotCacheDir(checkDeviceResp.snapshot),
          url: checkDeviceResp.url,
          versionId: checkDeviceResp.snapshot
        };
        this._savePrefs(prefs);
      }
      return checkDeviceResp;
    }

    throw new Error(`Error Status ${resp.status}: ${jsonResp ? jsonResp.error.message : await resp.text()}`);
  }

  async downloadUpdate(progress?: CallbackFunction<string>): Promise<string> {
    const prefs = await this._savedPreferences;
    return this._downloadUpdate(prefs, progress);
  }

  private async _downloadUpdate(prefs: ISavedPreferences, progress?: CallbackFunction<string>): Promise<string> {
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
      this._savePrefs(prefs);
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
    const prefs = await this._savedPreferences;
    return this._extractUpdate(prefs, progress);
  }

  private async _extractUpdate(prefs: ISavedPreferences, progress?: CallbackFunction<string>): Promise<string> {
    if (!prefs.availableUpdate || prefs.availableUpdate.state !== 'pending') {
      throw new Error('No pending update to extract');
    }
    const versionId = prefs.availableUpdate.versionId;
    const manifestString = await this._fileManager.getFile(
      this.getManifestCacheDir(),
      this._getManifestName(versionId)
    );
    const manifest: ManifestFileEntry[] = JSON.parse(manifestString);
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
    this._savePrefs(prefs);
    return 'true';
  }

  async reloadApp(): Promise<string> {
    const prefs = await this._savedPreferences;
    return this._reloadApp(prefs);
  }

  private async _reloadApp(prefs: ISavedPreferences): Promise<string> {
    if (prefs.availableUpdate && prefs.availableUpdate.state === UpdateState.Ready) {
      prefs.currentVersionId = prefs.availableUpdate.versionId;
      this._savePrefs(prefs);
    }
    if (prefs.currentVersionId) {
      if (this._isRunningVersion(prefs.currentVersionId)) {
        console.log(`Already running version ${prefs.currentVersionId}`);
        return 'true';
      }
      if (!(prefs.currentVersionId in prefs.updates)) {
        console.error(`Missing version ${prefs.currentVersionId}`);
        return 'false';
      }
      const update = prefs.updates[prefs.currentVersionId];
      const newLocation = new URL(`${update.path}/index.html`);
      console.log(`Redirecting window to ${newLocation}`);
      window.location.pathname = newLocation.pathname;
    }

    return 'true';
  }

  private _isRunningVersion(versionId: string) {
    return window.location.pathname.includes(versionId);
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
    const versionId = (await this._savedPreferences).currentVersionId;
    if (typeof versionId === 'string') {
      return this.getVersionById(versionId);
    }
    throw new Error('No current version applied.');
  }

  async getVersionById(versionId: string): Promise<ISnapshotInfo> {
    // TODO: Implement
    // cordova.exec(success, failure, 'IonicDeploy', 'info');
    return {
      deploy_uuid: 'TODO',
      versionId: 'TODO',
      channel: 'todo',
      binary_version: 'todo',
      binaryVersion: 'todo'
    };
  }

  async getAvailableVersions(): Promise<ISnapshotInfo[]> {
    // TODO: Implement
    // cordova.exec(success, failure, 'IonicDeploy', 'getVersions');
    return [{
      deploy_uuid: 'TODO',
      versionId: 'TODO',
      channel: 'todo',
      binary_version: 'todo',
      binaryVersion: 'todo'
    }];
  }

  async deleteVersionById(versionId: string): Promise<string> {
    // TODO: Implement
    // cordova.exec(success, failure, 'IonicDeploy', 'deleteVersion', [version]);
    return 'Implement me please';
  }

  async sync(syncOptions: ISyncOptions = {}): Promise<ISnapshotInfo> {

    const prefs = await this._savedPreferences;
    return this._sync(prefs, syncOptions);
  }

  private async _sync(prefs: ISavedPreferences, syncOptions: ISyncOptions = {}): Promise<ISnapshotInfo> {

    // TODO: Get API override if present?
    const updateMethod = syncOptions.updateMethod || prefs.updateMethod;

    await this._checkForUpdate(prefs);

    if (prefs.availableUpdate) {
      if (prefs.availableUpdate.state === UpdateState.Available) {
        await this._downloadUpdate(prefs);
      }
      if (prefs.availableUpdate.state === UpdateState.Pending) {
        await this._extractUpdate(prefs);
      }
      if (prefs.availableUpdate.state === UpdateState.Ready && updateMethod === UpdateMethod.AUTO) {
        await this._reloadApp(prefs);
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
      dirEntry.getFile(fileName, {create: createFile, exclusive: false}, async (fileEntry: FileEntry) => {
        if (dataBlob) {
          await this.writeFile(fileEntry, dataBlob);
        }
        resolve(fileEntry);
      }, reject);
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

class IonicDeployV4 implements IDeployPluginV4 {
  private delegate: IDeployPluginV5;

  constructor(delegate: IDeployPluginV5) {
    this.delegate = delegate;
  }

  init(config: any, success: Function, failure: Function): void {
    console.warn('This function has been deprecated in favor of IonicCordova.deploy.configure.');
    this.delegate.configure(config).then(
      result => success(),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  check(success: Function, failure: Function): void {
    console.warn('This function has been deprecated in favor of IonicCordova.deploy.checkForUpdate.');
    this.delegate.checkForUpdate().then(
      result => success(String(result.available)),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  download(success: Function, failure: Function): void {
    console.warn('This function has been deprecated in favor of IonicCordova.deploy.downloadUpdate.');
    this.delegate.downloadUpdate().then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  extract(success: Function, failure: Function): void {
    console.warn('This function has been deprecated in favor of IonicCordova.deploy.extractUpdate.');
    this.delegate.extractUpdate().then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  redirect(success: Function, failure: Function): void {
    console.warn('This function has been deprecated in favor of IonicCordova.deploy.reloadApp.');
    this.delegate.reloadApp().then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  info(success: Function, failure: Function): void {
    console.warn('This function has been deprecated in favor of IonicCordova.deploy.getCurrentVersion.');
    this.delegate.getCurrentVersion().then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  getVersions(success: Function, failure: Function): void {
    console.warn('This function has been deprecated in favor of IonicCordova.deploy.getAvailableVersions.');
    this.delegate.getAvailableVersions().then(
      results => success(results.map(result => result.versionId)),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  deleteVersion(version: string, success: Function, failure: Function): void {
    console.warn('This function has been deprecated in favor of IonicCordova.deploy.deleteVersionById.');
    this.delegate.deleteVersionById(version).then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  parseUpdate(jsonResponse: any, success: Function, failure: Function): void {
    // TODO
  }
}

/**
 * BASE API
 *
 * All features of the Ionic Cordova plugin are registered here, along with some low level error tracking features used
 * by the monitoring service.
 */
class IonicCordova implements IPluginBaseAPI {

  public deploy: IDeployPluginV4;
  public deploy5: IDeployPluginV5;

  constructor() {
    this.deploy5 = new IonicDeployV5(this);
    this.deploy = new IonicDeployV4(this.deploy5);
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
