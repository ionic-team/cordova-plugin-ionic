[Cordova Plugin Ionic](../../README.md)

# Interface: IDeployConfig

The configuration for the deploy plugin on the device.

## Hierarchy

**IDeployConfig**

## Index

### Properties

* [appId](_ioniccordova_d_.ideployconfig.md#appid)
* [channel](_ioniccordova_d_.ideployconfig.md#channel)
* [debug](_ioniccordova_d_.ideployconfig.md#debug)
* [host](_ioniccordova_d_.ideployconfig.md#host)
* [maxVersions](_ioniccordova_d_.ideployconfig.md#maxversions)
* [minBackgroundDuration](_ioniccordova_d_.ideployconfig.md#minbackgroundduration)
* [updateMethod](_ioniccordova_d_.ideployconfig.md#updatemethod)

---

## Properties

<a id="appid"></a>

### `<Optional>` appId

**● appId**: *`undefined` \| `string`*

*Defined in [IonicCordova.d.ts:139](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L139)*

The [Ionic Pro](https://ionicframework.com/docs/pro/) app id.

___
<a id="channel"></a>

### `<Optional>` channel

**● channel**: *`undefined` \| `string`*

*Defined in [IonicCordova.d.ts:154](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L154)*

The [channel](https://ionicframework.com/docs/pro/deploy/channels) that the plugin should listen for updates on.

___
<a id="debug"></a>

### `<Optional>` debug

**● debug**: *`undefined` \| `true` \| `false`*

*Defined in [IonicCordova.d.ts:144](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L144)*

whether or not the app should in debug mode

___
<a id="host"></a>

### `<Optional>` host

**● host**: *`undefined` \| `string`*

*Defined in [IonicCordova.d.ts:149](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L149)*

*__ignore__*: 

___
<a id="maxversions"></a>

### `<Optional>` maxVersions

**● maxVersions**: *`undefined` \| `number`*

*Defined in [IonicCordova.d.ts:159](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L159)*

The number of previous updates to be cached on the device

___
<a id="minbackgroundduration"></a>

### `<Optional>` minBackgroundDuration

**● minBackgroundDuration**: *`undefined` \| `number`*

*Defined in [IonicCordova.d.ts:165](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L165)*

The number of seconds the app should be in the background for before the plugin considers it closed and checks for an updated on resume of the app.

___
<a id="updatemethod"></a>

### `<Optional>` updateMethod

**● updateMethod**: *"none" \| "auto" \| "background"*

*Defined in [IonicCordova.d.ts:170](https://github.com/ionic-team/cordova-plugin-ionic/blob/fe62482/types/IonicCordova.d.ts#L170)*

The update method the app should use when checking for available updates

___

