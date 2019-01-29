[Cordova Plugin Ionic](../../README.md)

# Interface: ICurrentConfig

The current configuration for the deploy plugin on the device.

## Hierarchy

**ICurrentConfig**

## Index

### Properties

* [appId](_ioniccordova_d_.icurrentconfig.md#appid)
* [binaryVersion](_ioniccordova_d_.icurrentconfig.md#binaryversion)
* [binaryVersionCode](_ioniccordova_d_.icurrentconfig.md#binaryversioncode)
* [binaryVersionName](_ioniccordova_d_.icurrentconfig.md#binaryversionname)
* [channel](_ioniccordova_d_.icurrentconfig.md#channel)
* [currentBuildId](_ioniccordova_d_.icurrentconfig.md#currentbuildid)
* [currentVersionId](_ioniccordova_d_.icurrentconfig.md#currentversionid)
* [disabled](_ioniccordova_d_.icurrentconfig.md#disabled)
* [host](_ioniccordova_d_.icurrentconfig.md#host)
* [maxVersions](_ioniccordova_d_.icurrentconfig.md#maxversions)
* [minBackgroundDuration](_ioniccordova_d_.icurrentconfig.md#minbackgroundduration)
* [updateMethod](_ioniccordova_d_.icurrentconfig.md#updatemethod)

---

## Properties

<a id="appid"></a>

###  appId

**● appId**: *`string`*

*Defined in [IonicCordova.d.ts:180](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L180)*

The [Ionic Pro](https://ionicframework.com/docs/pro/) app id.

___
<a id="binaryversion"></a>

###  binaryVersion

**● binaryVersion**: *`string`*

*Defined in [IonicCordova.d.ts:192](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L192)*

*__deprecated__*: The binary version of the native bundle versionName on Android or CFBundleShortVersionString on iOS deprecated in favor of versionName

___
<a id="binaryversioncode"></a>

###  binaryVersionCode

**● binaryVersionCode**: *`string`*

*Defined in [IonicCordova.d.ts:202](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L202)*

The build version code of the native bundle versionCode on Android or CFBundleVersion on iOS

___
<a id="binaryversionname"></a>

###  binaryVersionName

**● binaryVersionName**: *`string`*

*Defined in [IonicCordova.d.ts:197](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L197)*

The binary version of the native bundle versionName on Android or CFBundleShortVersionString on iOS

___
<a id="channel"></a>

###  channel

**● channel**: *`string`*

*Defined in [IonicCordova.d.ts:185](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L185)*

The [channel](https://ionicframework.com/docs/pro/deploy/channels) that the plugin should listen for updates on.

___
<a id="currentbuildid"></a>

### `<Optional>` currentBuildId

**● currentBuildId**: *`undefined` \| `string`*

*Defined in [IonicCordova.d.ts:238](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L238)*

The id of the currently applied build or undefined if none is applied.

___
<a id="currentversionid"></a>

### `<Optional>` currentVersionId

**● currentVersionId**: *`undefined` \| `string`*

*Defined in [IonicCordova.d.ts:233](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L233)*

The id of the currently applied updated or undefined if none is applied.

___
<a id="disabled"></a>

###  disabled

**● disabled**: *`boolean`*

*Defined in [IonicCordova.d.ts:207](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L207)*

Whether the user disabled deploy updates or not.

___
<a id="host"></a>

###  host

**● host**: *`string`*

*Defined in [IonicCordova.d.ts:212](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L212)*

The host API the plugin is configured to check for updates from.

___
<a id="maxversions"></a>

###  maxVersions

**● maxVersions**: *`number`*

*Defined in [IonicCordova.d.ts:222](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L222)*

The maximum number of updates to be stored locally on the device.

___
<a id="minbackgroundduration"></a>

###  minBackgroundDuration

**● minBackgroundDuration**: *`number`*

*Defined in [IonicCordova.d.ts:228](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L228)*

The number of seconds the app needs to be in the background before the plugin considers it closed for the purposes of fetching and applying a new update.

___
<a id="updatemethod"></a>

###  updateMethod

**● updateMethod**: *"none" \| "auto" \| "background"*

*Defined in [IonicCordova.d.ts:217](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L217)*

The currently configured updateMethod for the plugin.

___

