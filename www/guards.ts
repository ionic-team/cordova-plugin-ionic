import {
  IPluginConfig
} from './definitions';

export function isPluginConfig(o: object): o is IPluginConfig {
  const obj = <IPluginConfig>o;
  return obj &&
    (obj.appId === undefined || typeof obj.appId === 'string') &&
    (obj.channel === undefined || typeof obj.channel === 'string') &&
    (obj.debug === undefined || typeof obj.debug === 'string') &&
    (obj.host === undefined || typeof obj.host === 'string');
}
