[Cordova Plugin Ionic](../../README.md)

# Interface: CheckForUpdateResponse

The response object describing if an update is available.

## Hierarchy

**CheckForUpdateResponse**

## Index

### Properties

* [available](checkforupdateresponse.md#available)
* [build](checkforupdateresponse.md#build)
* [compatible](checkforupdateresponse.md#compatible)
* [incompatibleUpdateAvailable](checkforupdateresponse.md#incompatibleupdateavailable)
* [partial](checkforupdateresponse.md#partial)
* [snapshot](checkforupdateresponse.md#snapshot)
* [url](checkforupdateresponse.md#url)

---

## Properties

<a id="available"></a>

###  available

**● available**: *`boolean`*

Whether or not an update is available.

___
<a id="build"></a>

### `<Optional>` build

**● build**: *`undefined` \| `string`*

The id of the build if available.

___
<a id="compatible"></a>

###  compatible

**● compatible**: *`boolean`*

Equivalent to available since v5 this can be ignored in favor of available
*__deprecated__*: 

___
<a id="incompatibleupdateavailable"></a>

### `<Optional>` incompatibleUpdateAvailable

**● incompatibleUpdateAvailable**: *`undefined` \| `true` \| `false`*

Whether or not there is an update available that is not compatible with this device.

___
<a id="partial"></a>

###  partial

**● partial**: *`false`*

Legacy indicator of whether the update is a partial one. This will always be false and can be ignored
*__deprecated__*: 

___
<a id="snapshot"></a>

### `<Optional>` snapshot

**● snapshot**: *`undefined` \| `string`*

The id of the snapshot if available.

___
<a id="url"></a>

### `<Optional>` url

**● url**: *`undefined` \| `string`*

The url to fetch the manifest of files in the update.

___

