[Cordova Plugin Ionic](../../README.md)

# Interface: IDeployPluginAPI

The Public API for the deploy Plugin

## Hierarchy

**IDeployPluginAPI**

## Index

### Methods

* [checkForUpdate](_ioniccordova_d_.ideploypluginapi.md#checkforupdate)
* [configure](_ioniccordova_d_.ideploypluginapi.md#configure)
* [deleteVersionById](_ioniccordova_d_.ideploypluginapi.md#deleteversionbyid)
* [downloadUpdate](_ioniccordova_d_.ideploypluginapi.md#downloadupdate)
* [extractUpdate](_ioniccordova_d_.ideploypluginapi.md#extractupdate)
* [getAvailableVersions](_ioniccordova_d_.ideploypluginapi.md#getavailableversions)
* [getConfiguration](_ioniccordova_d_.ideploypluginapi.md#getconfiguration)
* [getCurrentVersion](_ioniccordova_d_.ideploypluginapi.md#getcurrentversion)
* [reloadApp](_ioniccordova_d_.ideploypluginapi.md#reloadapp)
* [sync](_ioniccordova_d_.ideploypluginapi.md#sync)

---

## Methods

<a id="checkforupdate"></a>

###  checkForUpdate

▸ **checkForUpdate**(): `Promise`<[CheckForUpdateResponse](_ioniccordova_d_.checkforupdateresponse.md)>

*Defined in [IonicCordova.d.ts:35](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L35)*

*__description__*: Check for available updates for the currently configured app id and channel.

*__since__*: v5.0.0

**Returns:** `Promise`<[CheckForUpdateResponse](_ioniccordova_d_.checkforupdateresponse.md)>
A response describing an update if one is available.

___
<a id="configure"></a>

###  configure

▸ **configure**(config: *[IDeployConfig](_ioniccordova_d_.ideployconfig.md)*): `Promise`<`void`>

*Defined in [IonicCordova.d.ts:17](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L17)*

*__description__*: Update the default configuration for the plugin on the current device. The new configuration will be persisted across app close and binary updates.

*__since__*: v5.0.0

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| config | [IDeployConfig](_ioniccordova_d_.ideployconfig.md) |  The new configuration for the plugin on this device. |

**Returns:** `Promise`<`void`>

___
<a id="deleteversionbyid"></a>

###  deleteVersionById

▸ **deleteVersionById**(versionId: *`string`*): `Promise`<`boolean`>

*Defined in [IonicCordova.d.ts:105](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L105)*

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

▸ **downloadUpdate**(progress?: *[CallbackFunction](_ioniccordova_d_.callbackfunction.md)<`number`>*): `Promise`<`boolean`>

*Defined in [IonicCordova.d.ts:46](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L46)*

*__description__*: Download the new files from an available update found by the checkForUpdate method and prepare the update.

*__since__*: v5.0.0

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` progress | [CallbackFunction](_ioniccordova_d_.callbackfunction.md)<`number`> |  A progress callback function which will be called with a number representing the percent of completion of the download and prepare. |

**Returns:** `Promise`<`boolean`>
true if the download succeeded

___
<a id="extractupdate"></a>

###  extractUpdate

▸ **extractUpdate**(progress?: *[CallbackFunction](_ioniccordova_d_.callbackfunction.md)<`number`>*): `Promise`<`boolean`>

*Defined in [IonicCordova.d.ts:57](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L57)*

*__description__*: Extract a downloaded bundle of updated files.

*__since__*: v5.0.0

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` progress | [CallbackFunction](_ioniccordova_d_.callbackfunction.md)<`number`> |  A progress callback function which will be called with a number representing the percent of completion of the extract. |

**Returns:** `Promise`<`boolean`>
true if the extract succeeded

___
<a id="getavailableversions"></a>

###  getAvailableVersions

▸ **getAvailableVersions**(): `Promise`<[ISnapshotInfo](_ioniccordova_d_.isnapshotinfo.md)[]>

*Defined in [IonicCordova.d.ts:96](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L96)*

*__description__*: Get a list of the snapshots available on the device.

*__since__*: v5.0.0

**Returns:** `Promise`<[ISnapshotInfo](_ioniccordova_d_.isnapshotinfo.md)[]>
a list of available updates.

___
<a id="getconfiguration"></a>

###  getConfiguration

▸ **getConfiguration**(): `Promise`<[ICurrentConfig](_ioniccordova_d_.icurrentconfig.md)>

*Defined in [IonicCordova.d.ts:26](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L26)*

*__description__*: Get the current configuration for the plugin on the current device.

*__since__*: v5.0.0

**Returns:** `Promise`<[ICurrentConfig](_ioniccordova_d_.icurrentconfig.md)>
The current configuration of the plugin.

___
<a id="getcurrentversion"></a>

###  getCurrentVersion

▸ **getCurrentVersion**(): `Promise`<[ISnapshotInfo](_ioniccordova_d_.isnapshotinfo.md) \| `undefined`>

*Defined in [IonicCordova.d.ts:87](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L87)*

*__description__*: Get info about the currently deployed update or undefined if none are applied.

*__since__*: v5.0.0

**Returns:** `Promise`<[ISnapshotInfo](_ioniccordova_d_.isnapshotinfo.md) \| `undefined`>
The info about the currently applied update or undefined if none is applied.

___
<a id="reloadapp"></a>

###  reloadApp

▸ **reloadApp**(): `Promise`<`boolean`>

*Defined in [IonicCordova.d.ts:66](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L66)*

*__description__*: Reload the app if a more recent version of the app is available.

*__since__*: v5.0.0

**Returns:** `Promise`<`boolean`>
true if the reload succeeded

___
<a id="sync"></a>

###  sync

▸ **sync**(syncOptions: *[ISyncOptions](_ioniccordova_d_.isyncoptions.md)*): `Promise`<[ISnapshotInfo](_ioniccordova_d_.isnapshotinfo.md) \| `undefined`>

*Defined in [IonicCordova.d.ts:77](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L77)*

*__description__*: Check for an update, download it, and apply it in one step.

*__since__*: v5.0.0

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| syncOptions | [ISyncOptions](_ioniccordova_d_.isyncoptions.md) |  (Optional) Application update overrides. |

**Returns:** `Promise`<[ISnapshotInfo](_ioniccordova_d_.isnapshotinfo.md) \| `undefined`>
The info about the currently applied update or undefined if none is applied.

___

