
declare const cordova: Cordova;

import {
  CallbackFunction,
  IAppInfo,
  IDeployConfig,
  IDeployPluginAPI,
  IPluginBaseAPI,
  IPluginConfig,
  ISnapshotInfo,
  ISyncOptions,
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
    console.warn('This function has been deprecated in favor of IonicCordova.delpoy.configure.');
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
    console.warn('This function has been deprecated in favor of IonicCordova.delpoy.checkForUpdate.');
    this.checkForUpdate().then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  async checkForUpdate(): Promise<string> {
    // TODO: Implement me
    // cordova.exec(success, failure, 'IonicDeploy', 'check');
    return 'Implment me please!';
  }

  download(success: CallbackFunction<string>, failure: CallbackFunction<string>) {
    console.warn('This function has been deprecated in favor of IonicCordova.delpoy.downloadUpdate.');
    this.downloadUpdate().then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  async downloadUpdate(): Promise<string> {
    // TODO: Implement me
    // cordova.exec(success, failure, 'IonicDeploy', 'download');
    return 'Implment me please!';
  }

  extract(success: CallbackFunction<string>, failure: CallbackFunction<string>) {
    console.warn('This function has been deprecated in favor of IonicCordova.delpoy.extractUpdate.');
    this.extractUpdate().then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  async extractUpdate(): Promise<string> {
    // TODO: Implement me
    // cordova.exec(success, failure, 'IonicDeploy', 'extract');
    return 'Implment me please!';
  }

  redirect(success: CallbackFunction<string>, failure: CallbackFunction<string>) {
    console.warn('This function has been deprecated in favor of IonicCordova.delpoy.reloadApp.');
    this.reloadApp().then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  async reloadApp(): Promise<string> {
    // TODO: Implement me
    // cordova.exec(success, failure, 'IonicDeploy', 'redirect');
    return 'Implment me please!';
  }

  info(success: CallbackFunction<ISnapshotInfo>, failure: CallbackFunction<string>) {
    console.warn('This function has been deprecated in favor of IonicCordova.delpoy.getCurrentVersion.');
    this.getCurrentVersion().then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  async getCurrentVersion(): Promise<ISnapshotInfo> {
    const versionId = (await this._pluginConfig).versionId;
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

  getVersions(success: CallbackFunction<string[]>, failure: CallbackFunction<string>) {
    console.warn('This function has been deprecated in favor of IonicCordova.delpoy.getAvailableVersions.');
    this.getAvailableVersions().then(
      results => success(results.map(result => result.versionId)),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
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

  deleteVersion(versionId: string, success: CallbackFunction<string>, failure: CallbackFunction<string>) {
    console.warn('This function has been deprecated in favor of IonicCordova.delpoy.deleteVersionById.');
    this.deleteVersionById(versionId).then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  async deleteVersionById(versionId: string): Promise<string> {
    // TODO: Implement
    // cordova.exec(success, failure, 'IonicDeploy', 'deleteVersion', [version]);
    return 'Implement me please';
  }

  async sync(syncOptions: ISyncOptions = {}): Promise<ISnapshotInfo> {
    // TODO:
    // const updateMethod = syncOptions.updateMethod || this._pluginConfig.updateMethod;
    // await checkForUpdate();
    // if update available and not stored locally
    //   await downloadUpdate();
    //   await extractUpdate();
    //   if updateMethod === 'auto'
    //     await reloadApp();
    return {
      deploy_uuid: 'TODO',
      versionId: 'TODO',
      channel: 'todo',
      binary_version: 'todo',
      binaryVersion: 'todo'
    };
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
    console.warn('This function has been deprecated in favor of IonicCordova.getAppDetails.');
    this.getAppDetails().then(
      result => success(result),
      err => {
        typeof err === 'string' ? failure(err) : failure(err.message);
      }
    );
  }

  async getAppDetails(): Promise<IAppInfo> {
    // TODO: Implement me
    // cordova.exec(success, failure, 'IonicCordovaCommon', 'getAppInfo');
    return {
      platform: 'todo',
      platformVersion: 'todo',
      version: 'todo',
      bundleName: 'todo',
      bundleVersion: 'todo'
    };
  }
}
