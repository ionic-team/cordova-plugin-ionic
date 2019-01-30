[Cordova Plugin Ionic](../../README.md)

# Interface: IDeployPluginAPI

The Public API for the deploy Plugin

## Hierarchy

**IDeployPluginAPI**

## Index

### Methods

* [checkForUpdate](ideploypluginapi.md#checkforupdate)
* [configure](ideploypluginapi.md#configure)
* [deleteVersionById](ideploypluginapi.md#deleteversionbyid)
* [downloadUpdate](ideploypluginapi.md#downloadupdate)
* [extractUpdate](ideploypluginapi.md#extractupdate)
* [getAvailableVersions](ideploypluginapi.md#getavailableversions)
* [getConfiguration](ideploypluginapi.md#getconfiguration)
* [getCurrentVersion](ideploypluginapi.md#getcurrentversion)
* [reloadApp](ideploypluginapi.md#reloadapp)
* [sync](ideploypluginapi.md#sync)

---

## Methods

<a id="checkforupdate"></a>

###  checkForUpdate

▸ **checkForUpdate**(): `Promise`<[CheckForUpdateResponse](checkforupdateresponse.md)>

*__description__*: Check for available updates for the currently configured app id and channel.

*__since__*: v5.0.0

**Returns:** `Promise`<[CheckForUpdateResponse](checkforupdateresponse.md)>
A response describing an update if one is available.

___
<a id="configure"></a>

###  configure

▸ **configure**(config: *[IDeployConfig](ideployconfig.md)*): `Promise`<`void`>

*__description__*: Update the default configuration for the plugin on the current device. The new configuration will be persisted across app close and binary updates.

*__since__*: v5.0.0

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| config | [IDeployConfig](ideployconfig.md) |  The new configuration for the plugin on this device. |

**Returns:** `Promise`<`void`>

___
<a id="deleteversionbyid"></a>

###  deleteVersionById

▸ **deleteVersionById**(versionId: *`string`*): `Promise`<`boolean`>

*__description__*: Remove the files specific to a snapshot from the device.

**Parameters:**

| Name | Type |
| ------ | ------ |
| versionId | `string` |

**Returns:** `Promise`<`boolean`>
true if the update was deleted.

___
<a id="downloadupdate"></a>

###  downloadUpdate

▸ **downloadUpdate**(progress?: *[CallbackFunction](callbackfunction.md)<`number`>*): `Promise`<`boolean`>

*__description__*: Download the new files from an available update found by the checkForUpdate method and prepare the update.

*__since__*: v5.0.0

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` progress | [CallbackFunction](callbackfunction.md)<`number`> |  A progress callback function which will be called with a number representing the percent of completion of the download and prepare. |

**Returns:** `Promise`<`boolean`>
true if the download succeeded

___
<a id="extractupdate"></a>

###  extractUpdate

▸ **extractUpdate**(progress?: *[CallbackFunction](callbackfunction.md)<`number`>*): `Promise`<`boolean`>

*__description__*: Extract a downloaded bundle of updated files.

*__since__*: v5.0.0

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` progress | [CallbackFunction](callbackfunction.md)<`number`> |  A progress callback function which will be called with a number representing the percent of completion of the extract. |

**Returns:** `Promise`<`boolean`>
true if the extract succeeded

___
<a id="getavailableversions"></a>

###  getAvailableVersions

▸ **getAvailableVersions**(): `Promise`<[ISnapshotInfo](isnapshotinfo.md)[]>

*__description__*: Get a list of the snapshots available on the device.

*__since__*: v5.0.0

**Returns:** `Promise`<[ISnapshotInfo](isnapshotinfo.md)[]>
a list of available updates.

___
<a id="getconfiguration"></a>

###  getConfiguration

▸ **getConfiguration**(): `Promise`<[ICurrentConfig](icurrentconfig.md)>

*__description__*: Get the current configuration for the plugin on the current device.

*__since__*: v5.0.0

**Returns:** `Promise`<[ICurrentConfig](icurrentconfig.md)>
The current configuration of the plugin.

___
<a id="getcurrentversion"></a>

###  getCurrentVersion

▸ **getCurrentVersion**(): `Promise`<[ISnapshotInfo](isnapshotinfo.md) \| `undefined`>

*__description__*: Get info about the currently deployed update or undefined if none are applied.

*__since__*: v5.0.0

**Returns:** `Promise`<[ISnapshotInfo](isnapshotinfo.md) \| `undefined`>
The info about the currently applied update or undefined if none is applied.

___
<a id="reloadapp"></a>

###  reloadApp

▸ **reloadApp**(): `Promise`<`boolean`>

*__description__*: Reload the app if a more recent version of the app is available.

*__since__*: v5.0.0

**Returns:** `Promise`<`boolean`>
true if the reload succeeded

___
<a id="sync"></a>

###  sync

▸ **sync**(syncOptions: *[ISyncOptions](isyncoptions.md)*): `Promise`<[ISnapshotInfo](isnapshotinfo.md) \| `undefined`>

*__description__*: Check for an update, download it, and apply it in one step.

*__since__*: v5.0.0

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| syncOptions | [ISyncOptions](isyncoptions.md) |  (Optional) Application update overrides. |

**Returns:** `Promise`<[ISnapshotInfo](isnapshotinfo.md) \| `undefined`>
The info about the currently applied update or undefined if none is applied.

___

