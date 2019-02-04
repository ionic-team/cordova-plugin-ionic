[Cordova Plugin Ionic](../../README.md)

# Interface: ICurrentConfig

The current configuration for the deploy plugin on the device.

## Hierarchy

**ICurrentConfig**

## Index

### Properties

* [appId](icurrentconfig.md#appid)
* [binaryVersion](icurrentconfig.md#binaryversion)
* [binaryVersionCode](icurrentconfig.md#binaryversioncode)
* [binaryVersionName](icurrentconfig.md#binaryversionname)
* [channel](icurrentconfig.md#channel)
* [currentBuildId](icurrentconfig.md#currentbuildid)
* [currentVersionId](icurrentconfig.md#currentversionid)
* [disabled](icurrentconfig.md#disabled)
* [host](icurrentconfig.md#host)
* [maxVersions](icurrentconfig.md#maxversions)
* [minBackgroundDuration](icurrentconfig.md#minbackgroundduration)
* [updateMethod](icurrentconfig.md#updatemethod)

---

## Properties

<a id="appid"></a>

###  appId

**● appId**: *`string`*

The [Ionic Pro](https://ionicframework.com/docs/pro/) app id.

___
<a id="binaryversion"></a>

###  binaryVersion

**● binaryVersion**: *`string`*

*__deprecated__*: The binary version of the native bundle versionName on Android or CFBundleShortVersionString on iOS deprecated in favor of versionName

___
<a id="binaryversioncode"></a>

###  binaryVersionCode

**● binaryVersionCode**: *`string`*

The build version code of the native bundle versionCode on Android or CFBundleVersion on iOS

___
<a id="binaryversionname"></a>

###  binaryVersionName

**● binaryVersionName**: *`string`*

The binary version of the native bundle versionName on Android or CFBundleShortVersionString on iOS

___
<a id="channel"></a>

###  channel

**● channel**: *`string`*

The [channel](https://ionicframework.com/docs/pro/deploy/channels) that the plugin should listen for updates on.

___
<a id="currentbuildid"></a>

### `<Optional>` currentBuildId

**● currentBuildId**: *`undefined` \| `string`*

The id of the currently applied build or undefined if none is applied.

___
<a id="currentversionid"></a>

### `<Optional>` currentVersionId

**● currentVersionId**: *`undefined` \| `string`*

The id of the currently applied updated or undefined if none is applied.

___
<a id="disabled"></a>

###  disabled

**● disabled**: *`boolean`*

Whether the user disabled deploy updates or not.

___
<a id="host"></a>

###  host

**● host**: *`string`*

The host API the plugin is configured to check for updates from.

___
<a id="maxversions"></a>

###  maxVersions

**● maxVersions**: *`number`*

The maximum number of updates to be stored locally on the device.

___
<a id="minbackgroundduration"></a>

###  minBackgroundDuration

**● minBackgroundDuration**: *`number`*

The number of seconds the app needs to be in the background before the plugin considers it closed for the purposes of fetching and applying a new update.

___
<a id="updatemethod"></a>

###  updateMethod

**● updateMethod**: *"none" \| "auto" \| "background"*

The currently configured updateMethod for the plugin.

___

