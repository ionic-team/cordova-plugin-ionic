export interface IDeployPluginAPI {
  init(config: any, success: Function, failure: Function): void;
  check(success: Function, failure: Function): void;
  download(success: Function, failure: Function): void;
  extract(success: Function, failure: Function): void;
  redirect(success: Function, failure: Function): void;
  info(success: Function, failure: Function): void;
  getVersions(success: Function, failure: Function): void;
  deleteVersion(version: string, success: Function, failure: Function): void;
}

export interface IPluginBaseAPI {
  getAppInfo(success: Function, failure: Function): void;
  getAppDetails(): Promise<IAppInfo>;
  deploy: IDeployPluginAPI;
}

export interface IDeployConfig {
  appId?: string;
  debug?: string;
  host?: string;
  channel?: string;
}

export interface ISavedPreferences {
  appId: string;
  debug: string;
  host: string;
  channel: string;
  updateMethod: string;
  maxVersions: number;
  currentVersionId?: string;
  availableUpdate?: CheckDeviceResponse;
}

export interface IStorePreferences {
  appId?: string;
  debug?: string;
  host?: string;
  channel?: string;
  updateMethod?: string;
  maxVersions?: number;
  currentVersionId?: string;
  availableUpdate?: CheckDeviceResponse;
}

export interface ManifestFileEntry {
  integrity: string;
  href: string;
  size: number;
}

export interface FetchManifestResp {
  manifestBlob: Blob;
  fileBaseUrl: string;
}

export interface CallbackFunction<T> { (result?: T): void; }

export interface IAppInfo {
  platform: string;
  platformVersion: string;
  version: string;
  bundleName: string;
  bundleVersion: string;
}

export interface ISnapshotInfo {
  deploy_uuid: string;
  versionId: string; // NOTE: deprecating deploy_uuid in favor of versionId
  channel: string;
  binary_version: string;
  binaryVersion: string; // NOTE: binary_version in favor of binaryVersion
}

export interface ISyncOptions {
  updateMethod?: string;
}

export interface CheckDeviceResponse {
  available: boolean;
  snapshot?: string;
  url?: string;
  integrity?: string;
}
