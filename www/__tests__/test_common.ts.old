import * as IonicCordova from '../www/common';

let mockPluginAPI = {
  IonicDeploy: {
  },
  IonicCordova: {
  }
};

function mockCordova() {
  return {exec: execMock()};
};

function execMock() {
  return jest.fn( (success, error, pluginName, method, extras) => {
    return mockPluginAPI[pluginName][method](success, error);
  });
}

function callbackMock(returnValue: any, succeed: boolean) {
  return jest.fn( (success, error) => {
    succeed ? success(returnValue) : error(returnValue);
  });
}

const pluginConfig = {
  appId: 'myapp',
  disabled: false,
  host: 'https://myhost.com',
  channel: 'mychannel',
  updateMethod: 'auto',
  maxVersions: 5,
  currentVersionId: 'version1'
};

describe('IonicCordova', () => {

    beforeEach( () => {
      global.cordova = mockCordova();
    });

    afterEach( () => {
      mockPluginAPI = {
        IonicDeploy: {
        },
        IonicCordova: {
        }
      };
    });

    it('should have a deploy object', async () => {
      const pluginBase = IonicCordova;
      expect(pluginBase.deploy).toBeDefined();
    });

  describe('IonicDeploy', () => {

    afterEach( () => {
      mockPluginAPI = {
        IonicDeploy: {
        },
        IonicCordova: {
        }
      };
    });

    it('should have a parent object', async () => {
      mockPluginAPI.IonicCordova.getPreferences = callbackMock(pluginConfig, true)
      const pluginBase = IonicCordova;
      expect(pluginBase.deploy._parent).toBeDefined();
    });

    it('should set preferences on successful init of deploy plugin', async () => {
      mockPluginAPI.IonicCordova.getPreferences = callbackMock(pluginConfig, true)
      const pluginBase = IonicCordova;
      expect(global.cordova.exec.mock.calls.length).toBe(1);
      expect(global.cordova.exec.mock.calls[0][2]).toBe('IonicCordova');
      expect(global.cordova.exec.mock.calls[0][3]).toBe('getPreferences');
      expect(await pluginBase.deploy._pluginConfig).toEqual(pluginConfig);
    });

    it('should log returned error on failed initialization of deploy plugin', async () => {
      mockPluginAPI.IonicCordova.getPreferences = callbackMock('random failure', false)
      const pluginBase = IonicCordova;
      expect(global.cordova.exec.mock.calls.length).toBe(1);
      expect(global.cordova.exec.mock.calls[0][2]).toBe('IonicCordova');
      expect(global.cordova.exec.mock.calls[0][3]).toBe('getPreferences');
      expect(pluginBase.deploy._pluginConfig).rejects
    });

    describe('init', () => {

      afterEach( () => {
        mockPluginAPI = {
          IonicDeploy: {
          },
          IonicCordova: {
          }
        };
      });

      it('should call the failure function when passed a bad config', async done => {
        mockPluginAPI.IonicCordova.getPreferences = callbackMock(pluginConfig, true)
        const pluginBase = IonicCordova;
        const badConfig = {
          appId: 26
        };
        const success = function(result) {
          expect(true).toEqual(false);
          done();
        };
        const failure = function(err) {
          expect(err).toBe('Invalid Config Object');
          done();
        };
        expect(pluginBase.deploy.init(badConfig, success, failure)).toBe(undefined);
      }

      it('should update preferences when called', async done => {
        mockPluginAPI.IonicCordova.getPreferences = callbackMock(pluginConfig, true)
        const pluginBase = IonicCordova;
        expect(await pluginBase.deploy._pluginConfig).toEqual(pluginConfig);
        const newConfig = {
          appId: 'newappid',
          disabled: true,
          host: 'http://newhost.com',
          channel: 'newchannel',
        }
        mockPluginAPI.IonicDeploy.syncPreferences = callbackMock(undefined, true)


        const success = function(result) {
          expect(result).toBeUndefined();
          done();
        };
        const failure = function(err) {
          expect(true).toEqual(false);
          done();
        };
        pluginBase.deploy.init(newConfig, success, failure);
        const expectedConfig = Object.assign({}, pluginConfig, newConfig);
        expect(await pluginBase.deploy._pluginConfig).toEqual(expectedConfig);

        expect(global.cordova.exec.mock.calls.length).toBe(2);
        expect(global.cordova.exec.mock.calls[0][2]).toBe('IonicCordova');
        expect(global.cordova.exec.mock.calls[0][3]).toBe('getPreferences');
        expect(global.cordova.exec.mock.calls[1][2]).toBe('IonicDeploy');
        expect(global.cordova.exec.mock.calls[1][3]).toBe('syncPreferences');
      });

      it('should update preferences multiple times when called more than once', async done => {
        mockPluginAPI.IonicCordova.getPreferences = callbackMock(pluginConfig, true)
        const pluginBase = IonicCordova;
        expect(await pluginBase.deploy._pluginConfig).toEqual(pluginConfig);
        mockPluginAPI.IonicDeploy.syncPreferences = callbackMock(undefined, true)

        const success = function(result) {
          expect(result).toBeUndefined();
          done();
        };
        const failure = function(err) {
          expect(true).toEqual(false);
          done();
        };
        let newConfig = {
          channel: 'newchannel',
        };
        pluginBase.deploy.init(newConfig, success, failure);
        let expectedConfig = Object.assign({}, pluginConfig, newConfig);
        expect(await pluginBase.deploy._pluginConfig).toEqual(expectedConfig);

        newConfig = {
          channel: 'anotherchannel'
        };

        expectedConfig = Object.assign({}, pluginConfig, newConfig);
        expect(await pluginBase.deploy._pluginConfig).toEqual(expectedConfig);

        expect(global.cordova.exec.mock.calls.length).toBe(3);
        expect(global.cordova.exec.mock.calls[0][2]).toBe('IonicCordova');
        expect(global.cordova.exec.mock.calls[0][3]).toBe('getPreferences');
        expect(global.cordova.exec.mock.calls[1][2]).toBe('IonicDeploy');
        expect(global.cordova.exec.mock.calls[1][3]).toBe('syncPreferences');
        expect(global.cordova.exec.mock.calls[2][2]).toBe('IonicDeploy');
        expect(global.cordova.exec.mock.calls[2][3]).toBe('syncPreferences');

      });

      it('should call failure when initialization has failed to get preferences', async done => {
        mockPluginAPI.IonicCordova.getPreferences = callbackMock('some error', false)
        const pluginBase = IonicCordova;
        const newConfig = {
          appId: 'newappid',
          disabled: true,
          host: 'http://newhost.com',
          channel: 'newchannel',
        }

        const success = function(succ) {
          expect(true).toEqual(false);
          done();
        };
        const fail = function(err) {
          expect(err).toEqual('some error');
          done();
        };
        await pluginBase.deploy.init(newConfig, success, fail);
      });
    }

    describe('configure', () => {

      afterEach( () => {
        mockPluginAPI = {
          IonicDeploy: {
          },
          IonicCordova: {
          }
        };
      });

      it('should throw when passed a bad config', async () => {
        mockPluginAPI.IonicCordova.getPreferences = callbackMock(pluginConfig, true)
        const pluginBase = IonicCordova;
        const badConfig = {
          appId: 26
        };
        expect(pluginBase.deploy.configure(badConfig)).rejects.toThrow('Invalid Config Object');
      }

      it('should update preferences when called', async () => {
        mockPluginAPI.IonicCordova.getPreferences = callbackMock(pluginConfig, true)
        const pluginBase = IonicCordova;
        expect(pluginBase.deploy._pluginConfig).resolves.toBe(pluginConfig);
        const newConfig = {
          appId: 'newappid',
          disabled: true,
          host: 'http://newhost.com',
          channel: 'newchannel',
        }
        mockPluginAPI.IonicDeploy.syncPreferences = callbackMock(undefined, true)
        expect(pluginBase.deploy.configure(newConfig)).resolves.toBe(undefined);
        const expectedConfig = Object.assign({}, pluginConfig, newConfig);
        expect(pluginBase.deploy._pluginConfig).resolves.toBe(expectedConfig);
      }

      it('should reject when initilization has failed to get preferences', async () => {
        mockPluginAPI.IonicCordova.getPreferences = callbackMock('some error', false)
        const pluginBase = IonicCordova;
        const newConfig = {
          appId: 'newappid',
          disabled: true,
          host: 'http://newhost.com',
          channel: 'newchannel',
        }
        expect(pluginBase.deploy.configure(newConfig)).rejects.toThrow('some error');
      });

      it('should update preferences multiple times when called more than once', async () => {

        mockPluginAPI.IonicCordova.getPreferences = callbackMock(pluginConfig, true)
        const pluginBase = IonicCordova;
        expect(pluginBase.deploy._pluginConfig).resolves.toBe(pluginConfig);

        let newConfig = {
          channel: 'channel1',
        }
        mockPluginAPI.IonicDeploy.syncPreferences = callbackMock(undefined, true)
        expect(pluginBase.deploy.configure(newConfig)).resolves.toBe(undefined);
        let expectedConfig = Object.assign({}, pluginConfig, newConfig);
        expect(pluginBase.deploy._pluginConfig).resolves.toBe(expectedConfig);
        newConfig = {
          channel: 'channel2'
        }

        expectedConfig = Object.assign({}, pluginConfig, newConfig);
        expect(pluginBase.deploy.configure(newConfig)).resolves.toBe(undefined);
        expect(pluginBase.deploy._pluginConfig).resolves.toBe(expectedConfig);
      }
    });
  }
});
