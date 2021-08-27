import { IonicCordova, IonicDeploy } from "./www/models";
import { JSDOM } from "jsdom"
import { mock, when, instance } from 'ts-mockito';

declare global {
  var mockPluginAPI: MockPluginAPI;
}

interface MockPluginAPI {
  IonicDeploy: IonicDeploy;
  IonicCordova: IonicCordova;
}

function mockCordova(): Cordova {
  return {
    exec: execMock(),
    require: () => instance(mockedChannel)
  } as Partial<Cordova> as Cordova;
};

interface Channel {
  onNativeReady: { subscribe: (fn: () => void) => void };
  createSticky: (a: string) => void;
  waitForInitialization: (a: string) => void;
}

export const mockedChannel: Channel = mock<Channel>();
when(mockedChannel.waitForInitialization('onIonicProReady')).thenReturn()
when(mockedChannel.createSticky('onIonicProReady')).thenReturn()
when(mockedChannel.onNativeReady).thenReturn({ subscribe: (fn) => fn() });

type FunctionOf<T> = keyof Pick<T, { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]>;

function execMock(): any {
  return jest.fn((success, error, pluginName: keyof MockPluginAPI, method: FunctionOf<IonicCordova> | FunctionOf<IonicDeploy>, extras) => {
    if (pluginName === "IonicCordova") {
      return global.mockPluginAPI[pluginName][method as FunctionOf<IonicCordova>](success, error) as any;
    } else if (pluginName === "IonicDeploy") {
      return global.mockPluginAPI[pluginName][method as FunctionOf<IonicDeploy>](success, error) as any;
    }
  });
}
global.cordova = mockCordova();
const dom = new JSDOM()
global.document = dom.window.document
global.window = dom.window as any;
global.mockPluginAPI = {
  IonicDeploy: {} as IonicDeploy,
  IonicCordova: {} as IonicCordova
}
