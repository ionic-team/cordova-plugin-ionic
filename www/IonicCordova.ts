declare global {
  interface Window {
    IonicCordova: IPluginBaseAPI;
  }
  type IDeployPluginAPI = DeployPluginAPI;
}

/**
 * The Public API for the deploy Plugin
 */
export interface DeployPluginAPI {

  /**
   * @description Update the default configuration for the plugin on the current device. The new configuration will be persisted across app close and binary updates.
   *
   * @since v5.0.0
   *
   * @param config The new configuration for the plugin on this device.
   */
  configure(config: IDeployConfig): Promise<void>;

  /**
   * @description Get the current configuration for the plugin on the current device.
   *
   * @since v5.0.0
   *
   * @return The current configuration of the plugin.
   */
  getConfiguration(): Promise<ICurrentConfig>;

  /**
   * @description Check for available updates for the currently configured app id and channel.
   *
   * @since v5.0.0
   *
   * @return  A response describing an update if one is available.
   */
  checkForUpdate(): Promise<CheckForUpdateResponse>;

  /**
   * @description Download the new files from an available update found by the checkForUpdate method and prepare the update.
   *
   * @since v5.0.0
   *
   * @param progress A progress callback function which will be called with a number representing the percent of completion of the download and prepare.
   *
   * @return  true if the download succeeded
   */
  downloadUpdate(progress?: CallbackFunction<number>): Promise<boolean>;

  /**
   * @description Extract a downloaded bundle of updated files.
   *
   * @since v5.0.0
   *
   * @param progress A progress callback function which will be called with a number representing the percent of completion of the extract.
   *
   * @return  true if the extract succeeded
   */
  extractUpdate(progress?: CallbackFunction<number>): Promise<boolean>;

  /**
   * @description Reload the app if a more recent version of the app is available.
   *
   * @since v5.0.0
   *
   * @return true if the reload succeeded
   */
  reloadApp(): Promise<boolean>;

  /**
   * @description Check for an update, download it, and apply it in one step.
   *
   * @since v5.0.0
   *
   * @param syncOptions (Optional) Application update overrides.
   *
   * @param progress (Optional) A callback which will recieve progress updates
   *
   * @return The info about the currently applied update or undefined if none is applied.
   */
  sync(syncOptions: ISyncOptions, progress?: CallbackFunction<number>): Promise<ISnapshotInfo | undefined>;

  /**
   *
   * @description Get info about the currently deployed update or undefined if none are applied.
   *
   * @since v5.0.0
   *
   * @return The info about the currently applied update or undefined if none is applied.
   */
  getCurrentVersion(): Promise<ISnapshotInfo | undefined>;

  /**
   * @description Get a list of the snapshots available on the device.
   *
   * @since v5.0.0
   *
   * @return a list of available updates.
   */
  getAvailableVersions(): Promise<ISnapshotInfo[]>;

  /**
   * @description Remove the files specific to a snapshot from the device.
   *
   * @param version The versionId
   *
   * @return true if the update was deleted.
   */
  deleteVersionById(versionId: string): Promise<boolean>;

  /**
   * @description Returns info specific to a snapshot from the device.
   *
   * @param version The versionId
   *
   * @return Returns info specific to a snapshot from the device.
   *
   */
  getVersionById(versionId: string): Promise<ISnapshotInfo | undefined>;
}

/**
 * The IonicCordova Plugin API
 */
export interface IPluginBaseAPI {
  /**
   *
   * @param success
   * @param failure
   */
  getAppInfo(success: Function, failure: Function): void;

  /**
   * @description Get info about the current app.
   *
   */
  getAppDetails(): Promise<IAppInfo>;

  /**
   * An instance of the Ionic Deploy Plugin API
   */
  deploy: IDeployPluginAPI;
}

/**
 * The configuration for the deploy plugin on the device.
 */
export interface IDeployConfig {

  /**
   * The [Ionic Pro](https://ionicframework.com/docs/pro/) app id.
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

  /**
   * Directory where the application files are stored
   */
  applicationDirectory: string;
}

/**
 * A callback function to handle the result.
 */
export interface CallbackFunction<T> { (result?: T): void; }
