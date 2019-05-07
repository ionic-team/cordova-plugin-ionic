/**
 * The configuration for the deploy plugin on the device.
 */
export interface IDeployConfig {

  /**
   * The [Ionic](https://ionicframework.com/docs/appflow/) app id.
   */
  appId?: string;

  /**
   * whether or not the app should in debug mode
   */
  debug?: boolean;

  /**
   * @ignore
   */
  host?: string;

  /**
   * The [channel](https://ionicframework.com/docs/pro/deploy/channels) that the plugin should listen for updates on.
   */
  channel?: string;

  /**
   * The number of previous updates to be cached on the device
   */
  maxVersions?: number;

  /**
   * The number of seconds the app should be in the background for before the plugin considers it closed
   * and checks for an updated on resume of the app.
   */
  minBackgroundDuration?: number;

  /**
   * The update method the app should use when checking for available updates
   */
  updateMethod?: 'none' | 'auto' | 'background';
}

/**
 * The current configuration for the deploy plugin on the device.
 */
export interface ICurrentConfig {
  /**
   * The [Ionic Pro](https://ionicframework.com/docs/pro/) app id.
   */
  appId: string;

  /**
   * The [channel](https://ionicframework.com/docs/pro/deploy/channels) that the plugin should listen for updates on.
   */
  channel: string;

  /**
   * @deprecated
   * The binary version of the native bundle versionName on Android or CFBundleShortVersionString on iOS
   * deprecated in favor of versionName
   */
  binaryVersion: string;

  /**
   * The binary version of the native bundle versionName on Android or CFBundleShortVersionString on iOS
   */
  binaryVersionName: string;

  /**
   * The build version code of the native bundle versionCode on Android or CFBundleVersion on iOS
   */
  binaryVersionCode: string;

  /**
   * Whether the user disabled deploy updates or not.
   */
  disabled: boolean;

  /**
   * The host API the plugin is configured to check for updates from.
   */
  host: string;

  /**
   * The currently configured updateMethod for the plugin.
   */
  updateMethod: 'none' | 'auto' | 'background';

  /**
   * The maximum number of updates to be stored locally on the device.
   */
  maxVersions: number;

  /**
   * The number of seconds the app needs to be in the background before the plugin considers it
   * closed for the purposes of fetching and applying a new update.
   */
  minBackgroundDuration: number;

  /**
   * The id of the currently applied updated or undefined if none is applied.
   */
  currentVersionId?: string;

  /**
   * The id of the currently applied build or undefined if none is applied.
   */
  currentBuildId?: string;
}

/**
 * Information about a snapshot
 */
export interface ISnapshotInfo {

  /**
   * @deprecated in favor of [versionId](#versionid)
   *
   * The id for the snapshot.
   */
  deploy_uuid: string;

  /**
   * The id for the snapshot.
   */
  versionId: string;

  /**
   * The id for the snapshot.
   */
  buildId: string;

  /**
   * The channel that the snapshot was downloaded for..
   */
  channel: string;

  /**
   * @deprecated in favor of [binaryVersion](#binaryversion)
   *
   * The binary version the snapshot was downloaded for.
   */
  binary_version: string;

  /**
   * @deprecated
   * The binary version the snapshot was downloaded for.
   * The versionName on Android or CFBundleShortVersionString on iOS this is the end user readable version listed on the stores.
   */
  binaryVersion: string;

  /**
   * The binary version name the snapshot was downloaded for.
   * The versionName on Android or CFBundleShortVersionString on iOS this is the end user readable version listed on the stores.
   */
  binaryVersionName: string;

  /**
   * The binary version build code the snapshot was downloaded for.
   * The versionCode on Android or CFBundleVersion on iOS this should be changed every time you do a new build debug or otherwise.
   */
  binaryVersionCode: string;
}

/**
 * Configuration options for the call to `sync`
 */
export interface ISyncOptions {
  /**
   * Whether the update should be applied immediately or on the next app start.
   */
  updateMethod?: 'background' | 'auto';
}

/**
 * The response object describing if an update is available.
 */
export interface CheckForUpdateResponse {
  /**
   * Whether or not an update is available.
   */
  available: boolean;

  /**
   * Equivalent to available since v5 this can be ignored in favor of available
   * @deprecated
   */
  compatible: boolean;

  /**
   * Legacy indicator of whether the update is a partial one. This will always be false and can be ignored
   * @deprecated
   */
  partial: false;

  /**
   * The id of the snapshot if available.
   */
  snapshot?: string;

  /**
   * The id of the build if available.
   */
  build?: string;

  /**
   * The url to fetch the manifest of files in the update.
   */
  url?: string;

  /**
   * Whether or not there is an update available that is not compatible with this device.
   */
  incompatibleUpdateAvailable?: boolean;
}

/**
 * Information about the application.
 */
export interface IAppInfo {

  /**
   * The platform that the app is currently installed on.
   */
  platform: 'ios' | 'android';

  /**
   * The version of the native platform.
   */
  platformVersion: string;

  /**
   * @deprecated
   * The versionCode on Android or CFBundleVersion on iOS this should be changed every time you do a new build debug or otherwise.
   */
  version: string;

  /**
   * The versionCode on Android or CFBundleVersion on iOS this should be changed every time you do a new build debug or otherwise.
   */
  binaryVersionCode: string | number;

  /**
   * The bundle name.
   */
  bundleName: string;

  /**
   * @deprecated
   * The versionName on Android or CFBundleShortVersionString on iOS this is the end user readable version listed on the stores.
   */
  bundleVersion: string;

  /**
   * The versionName on Android or CFBundleShortVersionString on iOS this is the end user readable version listed on the stores.
   */
  binaryVersionName: string;

  /**
   * A generated device ID (NOT a native device ID)
   */
  device: string;

  /**
   * Directory where the snapshots are stored
   */
  dataDirectory: string;
}

/**
 * A callback function to handle the result.
 */
export interface CallbackFunction<T> { (result?: T): void; }

/**
 * @hidden
 */
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

/**
 * @hidden
 */
export interface ISavedPreferences extends ICurrentConfig {
  availableUpdate?: IAvailableUpdate;
  updates: { [versionId: string]: IAvailableUpdate };
}

/**
 * @hidden
 */
export interface UpdateInfo {
  versionId: string;
  path: string;
}

/**
 * @hidden
 */
export interface ManifestFileEntry {
  integrity: string;
  href: string;
  size: number;
}

/**
 * @hidden
 */
export interface FetchManifestResp {
  manifestJson: ManifestFileEntry[];
  fileBaseUrl: string;
}
