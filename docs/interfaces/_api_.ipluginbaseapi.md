[Cordova Plugin Ionic](../../README.md)

# Interface: IPluginBaseAPI

The IonicCordova Plugin API

## Hierarchy

**IPluginBaseAPI**

## Index

### Properties

* [deploy](_api_.ipluginbaseapi.md#deploy)

### Methods

* [getAppDetails](_api_.ipluginbaseapi.md#getappdetails)
* [getAppInfo](_api_.ipluginbaseapi.md#getappinfo)

---

## Properties

<a id="deploy"></a>

###  deploy

**● deploy**: *[IDeployPluginAPI](_api_.ideploypluginapi.md)*

*Defined in [api.ts:181](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L181)*

An instance of the Ionic Deploy Plugin API

___

## Methods

<a id="getappdetails"></a>

###  getAppDetails

▸ **getAppDetails**(): `Promise`<[IAppInfo](_api_.iappinfo.md)>

*Defined in [api.ts:176](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L176)*

*__description__*: Get info about the current app.

**Returns:** `Promise`<[IAppInfo](_api_.iappinfo.md)>

___
<a id="getappinfo"></a>

###  getAppInfo

▸ **getAppInfo**(success: *`Function`*, failure: *`Function`*): `void`

*Defined in [api.ts:170](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L170)*

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| success | `Function` |  - |
| failure | `Function` |   |

**Returns:** `void`

___

