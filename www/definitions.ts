export interface INativePreferences {
  appId: string;
  binaryVersion?: string;
  debug: string;
  host: string;
  channel: string;
  updateMethod: 'none' | 'auto' | 'background';
  maxVersions: number;
}

export interface IAvailableUpdate {
  binaryVersion: string;
  channel: string;
  path: string;
  state: string;
  url: string;
  versionId: string;
}

export interface ISavedPreferences extends INativePreferences {
  currentVersionId?: string;
  availableUpdate?: IAvailableUpdate;
  updates: { [versionId: string]: IAvailableUpdate };
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

/**
 * A callback function to handle the result.
 */
export interface CallbackFunction<T> { (result?: T): void; }

export interface ISyncOptions {
  updateMethod?: 'background' | 'auto';
}
