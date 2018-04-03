
declare const cordova: Cordova;

import {
  CallbackFunction,
  IAppInfo,
  IDeployConfig,
  IDeployPluginAPI,
  IPluginBaseAPI,
  IPluginConfig,
  ISnapshotInfo,
} from './definitions';

import {
  isPluginConfig
} from './guards';

// NATIVE API TODO:
// getPreferences
// syncPreferences

/**
 * LIVE UPDATE API
 *
 * The plugin API for the live updates feature.
 */

class IonicDeploy implements IDeployPluginAPI {

  private _pluginConfig: Promise<IPluginConfig>;

  constructor() {
    this._pluginConfig = new Promise((resolve, reject) => {
      cordova.exec(resolve, reject, 'IonicCordova', 'getPreferences');
    });
  }

  init(config: IDeployConfig, success: CallbackFunction<void>, failure: CallbackFunction<string>) {
    console.warn('This function has been deprecated in favor of IonicCordova.delpoy.configure');
    this.configure(config).then(
      result => success(),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  async configure(config: IDeployConfig) {
    if (!isPluginConfig(config)) {
      throw new Error('Invalid Config Object');
    }
    const pluginConfig = Object.assign(await this._pluginConfig, config);
    const stringConfig = JSON.stringify(pluginConfig);
    return new Promise( (resolve, reject) => {
      cordova.exec(resolve, reject, 'IonicDeploy', 'syncPreferences', [stringConfig]);
    });
  }

  check(success: CallbackFunction<string>, failure: CallbackFunction<string>) {
    cordova.exec(success, failure, 'IonicDeploy', 'check');
  }

  download(success: CallbackFunction<string>, failure: CallbackFunction<string>) {
    cordova.exec(success, failure, 'IonicDeploy', 'download');
  }

  extract(success: CallbackFunction<string>, failure: CallbackFunction<string>) {
    cordova.exec(success, failure, 'IonicDeploy', 'extract');
  }

  redirect(success: CallbackFunction<string>, failure: CallbackFunction<string>) {
    cordova.exec(success, failure, 'IonicDeploy', 'redirect');
  }

  info(success: CallbackFunction<ISnapshotInfo>, failure: CallbackFunction<string>) {
    // TODO: Implement me
    // this.describeVersion(currentVersion, success, failure)
  }

  describeVersion(version: string, success: CallbackFunction<ISnapshotInfo>, failure: CallbackFunction<string>) {
    // TODO: Implement
  }

  getVersions(success: CallbackFunction<string[]>, failure: CallbackFunction<string>) {
    cordova.exec(success, failure, 'IonicDeploy', 'getVersions');
  }

  deleteVersion(version: string, success: CallbackFunction<string>, failure: CallbackFunction<string>) {
    cordova.exec(success, failure, 'IonicDeploy', 'deleteVersion', [version]);
  }
}

/**
 * BASE API
 *
 * All features of the Ionic Cordova plugin are registered here, along with some low level error tracking features used
 * by the monitoring service.
 */
export class IonicCordova implements IPluginBaseAPI {

  public deploy: IDeployPluginAPI;

  constructor() {
    this.deploy = new IonicDeploy();
  }

  getAppInfo(success: CallbackFunction<IAppInfo>, failure: CallbackFunction<string>) {
    cordova.exec(success, failure, 'IonicCordovaCommon', 'getAppInfo');
  }

}
