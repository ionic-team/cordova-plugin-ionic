interface Window {
  IonicCordova: IPluginBaseAPI;
}

/**
 * The Public API for the deploy Plugin
 */
interface IDeployPluginAPI {

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
  checkForUpdate(): Promise<CheckDeviceResponse>;

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
   * @return The info about the currently applied update or undefined if none is applied.
   */
  sync(syncOptions: ISyncOptions): Promise<ISnapshotInfo | undefined>;

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
}

/**
 * The IonicCordova Plugin API
 */
interface IPluginBaseAPI {
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
interface IDeployConfig {

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
}

/**
 * The current configuration for the deploy plugin on the device.
 */
interface ICurrentConfig {
  /**
   * The [Ionic Pro](https://ionicframework.com/docs/pro/) app id.
   */
  appId: string;

  /**
   * The [channel](https://ionicframework.com/docs/pro/deploy/channels) that the plugin should listen for updates on.
   */
  channel: string;

  /**
   * The binary version of the native bundle
   */
  binaryVersion: string;

  /**
   * Whether the plugin is in debug mode or not.
   */
  debug: string;

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
}

/**
 * Information about a snapshot
 */
interface ISnapshotInfo {

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
   * The binary version the snapshot was downloaded for.
   */
  binaryVersion: string;
}

/**
 * Configuration options for the call to `sync`
 */
interface ISyncOptions {
  /**
   * Whether the update should be applied immediately or on the next app start.
   */
  updateMethod?: 'background' | 'auto';
}

/**
 * The response object describing if an update is available.
 */
interface CheckDeviceResponse {
  /**
   * Whether or not an update is available.
   */
  available: boolean;

  /**
   * The id of the snapshot if available.
   */
  snapshot?: string;

  /**
   * The url to fetch the manifest of files in the update.
   */
  url?: string;

  /**
   * The checksum of the manifest file.
   */
  integrity?: string;
}

/**
 * Information about the application.
 */
interface IAppInfo {

  /**
   * The platform that the app is currently installed on.
   */
  platform: 'ios' | 'android';

  /**
   * The version of the native platform.
   */
  platformVersion: string;

  /**
   * The version name.
   */
  version: string;

  /**
   * The bundle name.
   */
  bundleName: string;

  /**
   * The bundle version.
   */
  bundleVersion: string;

  /**
   * A generated device ID (NOT a native device ID)
   */
  device: string;
}

/**
 * A callback function to handle the result.
 */
interface CallbackFunction<T> { (result?: T): void; }
