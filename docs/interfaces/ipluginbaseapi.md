[Cordova Plugin Ionic](../../README.md)

# Interface: IPluginBaseAPI

The IonicCordova Plugin API

## Hierarchy

**IPluginBaseAPI**

## Index

### Properties

* [deploy](ipluginbaseapi.md#deploy)

### Methods

* [getAppDetails](ipluginbaseapi.md#getappdetails)
* [getAppInfo](ipluginbaseapi.md#getappinfo)

---

## Properties

<a id="deploy"></a>

###  deploy

**● deploy**: *[IDeployPluginAPI](ideploypluginapi.md)*

An instance of the Ionic Deploy Plugin API

___

## Methods

<a id="getappdetails"></a>

###  getAppDetails

▸ **getAppDetails**(): `Promise`<[IAppInfo](iappinfo.md)>

*__description__*: Get info about the current app.

**Returns:** `Promise`<[IAppInfo](iappinfo.md)>

___
<a id="getappinfo"></a>

###  getAppInfo

▸ **getAppInfo**(success: *`Function`*, failure: *`Function`*): `void`

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| success | `Function` |  \- |
| failure | `Function` |   |

**Returns:** `void`

___

