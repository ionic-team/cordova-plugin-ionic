[Cordova Plugin Ionic](../../README.md)

# Interface: CheckForUpdateResponse

The response object describing if an update is available.

## Hierarchy

**CheckForUpdateResponse**

## Index

### Properties

* [available](_ioniccordova_d_.checkforupdateresponse.md#available)
* [build](_ioniccordova_d_.checkforupdateresponse.md#build)
* [compatible](_ioniccordova_d_.checkforupdateresponse.md#compatible)
* [incompatibleUpdateAvailable](_ioniccordova_d_.checkforupdateresponse.md#incompatibleupdateavailable)
* [partial](_ioniccordova_d_.checkforupdateresponse.md#partial)
* [snapshot](_ioniccordova_d_.checkforupdateresponse.md#snapshot)
* [url](_ioniccordova_d_.checkforupdateresponse.md#url)

---

## Properties

<a id="available"></a>

###  available

**● available**: *`boolean`*

*Defined in [IonicCordova.d.ts:312](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L312)*

Whether or not an update is available.

___
<a id="build"></a>

### `<Optional>` build

**● build**: *`undefined` \| `string`*

*Defined in [IonicCordova.d.ts:334](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L334)*

The id of the build if available.

___
<a id="compatible"></a>

###  compatible

**● compatible**: *`boolean`*

*Defined in [IonicCordova.d.ts:318](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L318)*

Equivalent to available since v5 this can be ignored in favor of available
*__deprecated__*: 

___
<a id="incompatibleupdateavailable"></a>

### `<Optional>` incompatibleUpdateAvailable

**● incompatibleUpdateAvailable**: *`undefined` \| `true` \| `false`*

*Defined in [IonicCordova.d.ts:344](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L344)*

Whether or not there is an update available that is not compatible with this device.

___
<a id="partial"></a>

###  partial

**● partial**: *`false`*

*Defined in [IonicCordova.d.ts:324](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L324)*

Legacy indicator of whether the update is a partial one. This will always be false and can be ignored
*__deprecated__*: 

___
<a id="snapshot"></a>

### `<Optional>` snapshot

**● snapshot**: *`undefined` \| `string`*

*Defined in [IonicCordova.d.ts:329](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L329)*

The id of the snapshot if available.

___
<a id="url"></a>

### `<Optional>` url

**● url**: *`undefined` \| `string`*

*Defined in [IonicCordova.d.ts:339](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L339)*

The url to fetch the manifest of files in the update.

___

