import { ICurrentConfig } from './IonicCordova';

export interface IAvailableUpdate {
  binaryVersionName: string;
  binaryVersionCode: string;
  channel: string;
  lastUsed: string;
  state: string;
  url: string;
  versionId: string;
  buildId: string;
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
  manifestJson: ManifestFileEntry[];
  fileBaseUrl: string;
}
