import {
  CallbackFunction,
  CheckForUpdateResponse,
  ICurrentConfig,
  IDeployConfig,
  ISnapshotInfo,
  ISyncOptions,
} from './IonicCordova';
/**
 * @hidden
 */
const deviceready = new Promise<IDeployPluginAPI>((resolve, rejects) => {
  document.addEventListener('deviceready', () => {
    if (window.IonicCordova) {
      return resolve(window.IonicCordova.deploy);
    }
    return rejects('cordova-plugin-ionic not found. Are you sure you installed it?');
  });
});

export class DeployClass implements IDeployPluginAPI {

  async configure(config: IDeployConfig) {
    const deploy = await deviceready;
    return deploy.configure(config);
  }

  async getConfiguration(): Promise<ICurrentConfig> {
    const deploy = await deviceready;
    return deploy.getConfiguration();
  }

  async checkForUpdate(): Promise<CheckForUpdateResponse> {
    const deploy = await deviceready;
    return deploy.checkForUpdate();
  }

  async downloadUpdate(progress?: CallbackFunction<number>) {
    const deploy = await deviceready;
    return deploy.downloadUpdate(progress);
  }

  async extractUpdate(progress?: CallbackFunction<number>) {
    const deploy = await deviceready;
    return deploy.extractUpdate(progress);
  }

  async reloadApp() {
    const deploy = await deviceready;
    return deploy.reloadApp();
  }

  async sync(options: ISyncOptions, progress?: CallbackFunction<number>) {
    const deploy = await deviceready;
    return deploy.sync(options, progress);
  }

  async getCurrentVersion(): Promise<ISnapshotInfo | undefined> {
    const deploy = await deviceready;
    return deploy.getCurrentVersion();
  }

  async getAvailableVersions() {
    const deploy = await deviceready;
    return deploy.getAvailableVersions();
  }

  async deleteVersionById(versionId: string) {
    const deploy = await deviceready;
    return deploy.deleteVersionById(versionId);
  }

  async getVersionById(versionId: string) {
    const deploy = await deviceready;
    return deploy.getVersionById(versionId);
  }
}

export const Deploy = new DeployClass();