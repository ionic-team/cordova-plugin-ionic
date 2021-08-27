// import { IDeployConfig } from '../IonicCordova';
import * as IonicCordova from '../common';

// function callbackMock(returnValue: any, succeed: boolean) {
//   return jest.fn((success, error) => {
//     succeed ? success(returnValue) : error(returnValue);
//   });
// }

// const pluginConfig: IDeployConfig = {
//   appId: 'myapp',
//   host: 'https://myhost.com',
//   channel: 'mychannel',
//   updateMethod: 'auto',
//   maxVersions: 5,
// };

describe('IonicCordova', () => {

  // let mockIonicDeploy: Mock<IonicDeploy>;
  // let mockIonicCordova: Mock<IonicCordova>;

  beforeEach(() => {
    // mockIonicDeploy = new Mock<IonicDeploy>();
    // mockIonicCordova = new Mock<IonicCordova>();
    // mockPluginAPI = {
    //   IonicDeploy: mockIonicDeploy.Object,
    //   IonicCordova: mockIonicCordova.Object
    // };
  });

  it('plugin instance should initialize new deploy object on construction', () => {
    const plugin = IonicCordova;
    expect(plugin.deploy).toBeDefined();
  });

  describe('IonicDeploy', () => {
    it('deploy plugin should have a reference to base plugin parent object', () => {
      jest.useFakeTimers()
      const plugin = IonicCordova;
      expect((plugin.deploy as any).parent).toBe(plugin);
      jest.runAllTimers()
    });

    // it('should set preferences on successful init of deploy plugin', async () => {
    //   mockPluginAPI.IonicCordova.getPreferences = callbackMock(pluginConfig, true)
    //   const pluginBase = Thingy;
    //   expect(global.cordova.exec.mock.calls.length).toBe(1);
    //   expect(global.cordova.exec.mock.calls[0][2]).toBe('IonicCordova');
    //   expect(global.cordova.exec.mock.calls[0][3]).toBe('getPreferences');
    //   expect(await pluginBase.deploy._pluginConfig).toEqual(pluginConfig);
    // });

    // it('should log returned error on failed initialization of deploy plugin', () => {
    //   mockPluginAPI.IonicCordova.getPreferences = callbackMock('random failure', false)
    //   const pluginBase = Thingy;
    //   expect(global.cordova.exec.mock.calls.length).toBe(1);
    //   expect(global.cordova.exec.mock.calls[0][2]).toBe('IonicCordova');
    //   expect(global.cordova.exec.mock.calls[0][3]).toBe('getPreferences');
    //   expect(pluginBase.deploy._pluginConfig).rejects
    // });
  });
});
