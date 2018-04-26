[Cordova Plugin Ionic](../../README.md)

# Interface: IDeployPluginAPI

The Public API for the deploy Plugin

## Hierarchy

**IDeployPluginAPI**

## Index

### Methods

* [check](_api_.ideploypluginapi.md#check)
* [checkForUpdate](_api_.ideploypluginapi.md#checkforupdate)
* [configure](_api_.ideploypluginapi.md#configure)
* [deleteVersion](_api_.ideploypluginapi.md#deleteversion)
* [deleteVersionById](_api_.ideploypluginapi.md#deleteversionbyid)
* [download](_api_.ideploypluginapi.md#download)
* [downloadUpdate](_api_.ideploypluginapi.md#downloadupdate)
* [extract](_api_.ideploypluginapi.md#extract)
* [getAvailableVersions](_api_.ideploypluginapi.md#getavailableversions)
* [getCurrentVersion](_api_.ideploypluginapi.md#getcurrentversion)
* [getVersions](_api_.ideploypluginapi.md#getversions)
* [info](_api_.ideploypluginapi.md#info)
* [init](_api_.ideploypluginapi.md#init)
* [parseUpdate](_api_.ideploypluginapi.md#parseupdate)
* [redirect](_api_.ideploypluginapi.md#redirect)
* [reloadApp](_api_.ideploypluginapi.md#reloadapp)

---

## Methods

<a id="check"></a>

###  check

▸ **check**(success: *[CallbackFunction](_api_.callbackfunction.md)<`string`>*, failure: *[CallbackFunction](_api_.callbackfunction.md)<`string`>*): `void`

*Defined in [api.ts:28](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L28)*

*__deprecated__*: in v5.0.0 use [checkForUpdate](#checkforupdate) in favor of this function.

*__description__*: Check for available updates for the currently configured app id and channel.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| success | [CallbackFunction](_api_.callbackfunction.md)<`string`> |  The callback that handles a successful check. On success this function will be called with the string 'true' or 'false' depending on whether a new update is available. |
| failure | [CallbackFunction](_api_.callbackfunction.md)<`string`> |  The callback that handles a failed check. On failure this function will be called with a string description of the failure. |

**Returns:** `void`

___
<a id="checkforupdate"></a>

###  checkForUpdate

▸ **checkForUpdate**(): `Promise`<[CheckDeviceResponse](_api_.checkdeviceresponse.md)>

*Defined in [api.ts:120](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L120)*

*__description__*: Check for available updates for the currently configured app id and channel.

*__since__*: v5.0.0

**Returns:** `Promise`<[CheckDeviceResponse](_api_.checkdeviceresponse.md)>

___
<a id="configure"></a>

###  configure

▸ **configure**(config: *[IDeployConfig](_api_.ideployconfig.md)*): `Promise`<`void`>

*Defined in [api.ts:113](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L113)*

*__description__*: Update the default configuration for the plugin on the current device. The new configuration will be persisted across app close and binary updates.

*__since__*: v5.0.0

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| config | [IDeployConfig](_api_.ideployconfig.md) |  The new configuration for the plugin on this device. |

**Returns:** `Promise`<`void`>

___
<a id="deleteversion"></a>

###  deleteVersion

▸ **deleteVersion**(version: *`string`*, success: *[CallbackFunction](_api_.callbackfunction.md)<`string`>*, failure: *[CallbackFunction](_api_.callbackfunction.md)<`string`>*): `void`

*Defined in [api.ts:97](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L97)*

*__deprecated__*: in v5.0.0 use [deleteVersionById](#deleteversionbyid) in favor of this function.

*__description__*: Remove the files specific to a snapshot from the device.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| version | `string` |  The version id of the snapshot to delete. |
| success | [CallbackFunction](_api_.callbackfunction.md)<`string`> |  A callback function which will receive a string 'true' upon successful deletion. |
| failure | [CallbackFunction](_api_.callbackfunction.md)<`string`> |  On failure to delete a snapshot this function will be called with a string description of the failure. |

**Returns:** `void`

___
<a id="deleteversionbyid"></a>

###  deleteVersionById

▸ **deleteVersionById**(versionId: *`string`*): `Promise`<`string`>

*Defined in [api.ts:158](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L158)*

*__description__*: Remove the files specific to a snapshot from the device.

**Parameters:**

| Param | Type |
| ------ | ------ |
| versionId | `string` | 

**Returns:** `Promise`<`string`>

___
<a id="download"></a>

###  download

▸ **download**(success: *[CallbackFunction](_api_.callbackfunction.md)<`string`>*, failure: *[CallbackFunction](_api_.callbackfunction.md)<`string`>*): `void`

*Defined in [api.ts:39](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L39)*

*__deprecated__*: in v5.0.0 use [downloadUpdate](#downloadupdate) in favor of this function.

*__description__*: Download the new files from an available update found by the check method.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| success | [CallbackFunction](_api_.callbackfunction.md)<`string`> |  The callback that handles a successful download. This function will be called during download with a string representing the percentage of download completion e.g. '1', '20', etc. and the string 'done' upon successful completion. |
| failure | [CallbackFunction](_api_.callbackfunction.md)<`string`> |  The callback that handles a failed download. On failure this function will be called with a string description of the failure. |

**Returns:** `void`

___
<a id="downloadupdate"></a>

###  downloadUpdate

▸ **downloadUpdate**(progress?: *[CallbackFunction](_api_.callbackfunction.md)<`string`>*): `Promise`<`string`>

*Defined in [api.ts:129](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L129)*

*__description__*: Download the new files from an available update found by the checkForUpdate method and prepare the update.

*__since__*: v5.0.0

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` progress | [CallbackFunction](_api_.callbackfunction.md)<`string`> |  A progress callback function which will be called with a number representing the percent of completion of the download and prepare. |

**Returns:** `Promise`<`string`>

___
<a id="extract"></a>

###  extract

▸ **extract**(success: *[CallbackFunction](_api_.callbackfunction.md)<`string`>*, failure: *[CallbackFunction](_api_.callbackfunction.md)<`string`>*): `void`

*Defined in [api.ts:50](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L50)*

*__deprecated__*: in v5.0.0 use [downloadUpdate](#downloadupdate) instead which downloads and prepares the update.

*__description__*: Extract the new files from a downloaded update so it is ready to load.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| success | [CallbackFunction](_api_.callbackfunction.md)<`string`> |  The callback that handles a successful extract. This function will be called multiple times during extract with a string representing the percentage complete e.g. '1', '20', etc. and the string 'done' upon successful completion. |
| failure | [CallbackFunction](_api_.callbackfunction.md)<`string`> |  The callback that handles a failed extract. On failure this function will be called with a string description of the failure. |

**Returns:** `void`

___
<a id="getavailableversions"></a>

###  getAvailableVersions

▸ **getAvailableVersions**(): `Promise`<[ISnapshotInfo](_api_.isnapshotinfo.md)[]>

*Defined in [api.ts:151](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L151)*

*__description__*: Get a list of the snapshots available on the device.

*__since__*: v5.0.0

**Returns:** `Promise`<[ISnapshotInfo](_api_.isnapshotinfo.md)[]>

___
<a id="getcurrentversion"></a>

###  getCurrentVersion

▸ **getCurrentVersion**(): `Promise`<[ISnapshotInfo](_api_.isnapshotinfo.md)>

*Defined in [api.ts:144](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L144)*

*__description__*: Get info about the currently deployed update.

*__since__*: v5.0.0

**Returns:** `Promise`<[ISnapshotInfo](_api_.isnapshotinfo.md)>

___
<a id="getversions"></a>

###  getVersions

▸ **getVersions**(success: *[CallbackFunction](_api_.callbackfunction.md)<`string`[]>*, failure: *[CallbackFunction](_api_.callbackfunction.md)<`string`>*): `void`

*Defined in [api.ts:84](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L84)*

*__deprecated__*: in v5.0.0 use [getAvailableVersions](#getavailableversions) in favor of this function.

*__description__*: Fetch the current version ids for snapshots stored locally on the device.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| success | [CallbackFunction](_api_.callbackfunction.md)<`string`[]> |  A callback function which will receive a list of string version ids for snapshots that are currently stored on the device. |
| failure | [CallbackFunction](_api_.callbackfunction.md)<`string`> |  On failure to fetch snapshot info this function will be called with a string description of the failure. |

**Returns:** `void`

___
<a id="info"></a>

###  info

▸ **info**(success: *[CallbackFunction](_api_.callbackfunction.md)<[ISnapshotInfo](_api_.isnapshotinfo.md)>*, failure: *[CallbackFunction](_api_.callbackfunction.md)<`string`>*): `void`

*Defined in [api.ts:73](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L73)*

*__deprecated__*: in v5.0.0 use [getCurrentVersion](#getcurrentversion) in favor of this function.

*__description__*: Fetch current information about the currently applied snapshot on this device.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| success | [CallbackFunction](_api_.callbackfunction.md)<[ISnapshotInfo](_api_.isnapshotinfo.md)> |  A callback function which will receive the object describing the currently deployed snapshot. |
| failure | [CallbackFunction](_api_.callbackfunction.md)<`string`> |  On failure to fetch snapshot info this function will be called with a string description of the failure. |

**Returns:** `void`

___
<a id="init"></a>

###  init

▸ **init**(config: *[IDeployConfig](_api_.ideployconfig.md)*, success: *[CallbackFunction](_api_.callbackfunction.md)<`void`>*, failure: *[CallbackFunction](_api_.callbackfunction.md)<`string`>*): `void`

*Defined in [api.ts:17](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L17)*

*__deprecated__*: in v5.0.0 use [configure](#configure) in favor of this function.

*__description__*: Update the default configuration for the plugin on the current device. The new configuration will be persisted across app close and binary updates.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| config | [IDeployConfig](_api_.ideployconfig.md) |  The new configuration for the plugin on this device. |
| success | [CallbackFunction](_api_.callbackfunction.md)<`void`> |  The callback that handles a successful configuration. On success this function will be called with no arguments. |
| failure | [CallbackFunction](_api_.callbackfunction.md)<`string`> |  The callback that handles a failed configuration. On failure this function will be called with a string description of the failure. |

**Returns:** `void`

___
<a id="parseupdate"></a>

###  parseUpdate

▸ **parseUpdate**(jsonResponse: *`any`*, success: *[CallbackFunction](_api_.callbackfunction.md)<`string`>*, failure: *[CallbackFunction](_api_.callbackfunction.md)<`string`>*): `void`

*Defined in [api.ts:102](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L102)*

*__deprecated__*: in v5.0.0

**Parameters:**

| Param | Type |
| ------ | ------ |
| jsonResponse | `any` | 
| success | [CallbackFunction](_api_.callbackfunction.md)<`string`> | 
| failure | [CallbackFunction](_api_.callbackfunction.md)<`string`> | 

**Returns:** `void`

___
<a id="redirect"></a>

###  redirect

▸ **redirect**(success: *[CallbackFunction](_api_.callbackfunction.md)<`string`>*, failure: *[CallbackFunction](_api_.callbackfunction.md)<`string`>*): `void`

*Defined in [api.ts:61](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L61)*

*__deprecated__*: in v5.0.0 use [reloadApp](#reloadapp) in favor of this function.

*__description__*: Redirect to the most recent available update stored on the device for the current app id and channel.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| success | [CallbackFunction](_api_.callbackfunction.md)<`string`> |  The callback that handles a successful redirect. |
| failure | [CallbackFunction](_api_.callbackfunction.md)<`string`> |  The callback that handles a failed redirect. On failure this function will be called with a string description of the failure. |

**Returns:** `void`

___
<a id="reloadapp"></a>

###  reloadApp

▸ **reloadApp**(): `Promise`<`string`>

*Defined in [api.ts:136](https://github.com/ionic-team/cordova-plugin-ionic/blob/4625b68/www/api.ts#L136)*

*__description__*: Reload the app if a more recent version of the app is available.

*__since__*: v5.0.0

**Returns:** `Promise`<`string`>

___

