export interface IAvailableUpdate {
  binaryVersion: string;
  channel: string;
  lastUsed: string;
  state: string;
  url: string;
  versionId: string;
}

export interface ISavedPreferences extends ICurrentConfig {
  availableUpdate?: IAvailableUpdate;
  updates: { [versionId: string]: IAvailableUpdate };
}

export interface UpdateInfo {
  versionId: string;
  path: string;
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
