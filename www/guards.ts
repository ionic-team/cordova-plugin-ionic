import { IDeployConfig } from './IonicCordova';

export function isPluginConfig(o: object): o is IDeployConfig {
  const obj = <IDeployConfig>o;
  const allowedKeys = ['appId', 'channel', 'disabled', 'host', 'maxVersions', 'minBackgroundDuration', 'updateMethod'];
  if (!obj) return false;
  for (const key in obj) {
    if (allowedKeys.indexOf(key) === -1) {
      return false;
    }
  }
  return obj &&
    (obj.appId === undefined || typeof obj.appId === 'string') &&
    (obj.channel === undefined || typeof obj.channel === 'string') &&
    (obj.debug === undefined || typeof obj.debug === 'string') &&
    (obj.updateMethod === undefined || typeof obj.updateMethod === 'string') &&
    (obj.maxVersions === undefined || typeof obj.maxVersions === 'number') &&
    (obj.minBackgroundDuration === undefined || typeof obj.minBackgroundDuration === 'number') &&
    (obj.host === undefined || typeof obj.host === 'string');
}
