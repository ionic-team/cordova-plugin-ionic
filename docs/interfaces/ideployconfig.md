[Cordova Plugin Ionic](../../README.md)

# Interface: IDeployConfig

The configuration for the deploy plugin on the device.

## Hierarchy

**IDeployConfig**

## Index

### Properties

* [appId](ideployconfig.md#appid)
* [channel](ideployconfig.md#channel)
* [debug](ideployconfig.md#debug)
* [host](ideployconfig.md#host)
* [maxVersions](ideployconfig.md#maxversions)
* [minBackgroundDuration](ideployconfig.md#minbackgroundduration)
* [updateMethod](ideployconfig.md#updatemethod)

---

## Properties

<a id="appid"></a>

### `<Optional>` appId

**● appId**: *`undefined` \| `string`*

The [Ionic Pro](https://ionicframework.com/docs/pro/) app id.

___
<a id="channel"></a>

### `<Optional>` channel

**● channel**: *`undefined` \| `string`*

The [channel](https://ionicframework.com/docs/pro/deploy/channels) that the plugin should listen for updates on.

___
<a id="debug"></a>

### `<Optional>` debug

**● debug**: *`undefined` \| `true` \| `false`*

whether or not the app should in debug mode

___
<a id="host"></a>

### `<Optional>` host

**● host**: *`undefined` \| `string`*

*__ignore__*: 

___
<a id="maxversions"></a>

### `<Optional>` maxVersions

**● maxVersions**: *`undefined` \| `number`*

The number of previous updates to be cached on the device

___
<a id="minbackgroundduration"></a>

### `<Optional>` minBackgroundDuration

**● minBackgroundDuration**: *`undefined` \| `number`*

The number of seconds the app should be in the background for before the plugin considers it closed and checks for an updated on resume of the app.

___
<a id="updatemethod"></a>

### `<Optional>` updateMethod

**● updateMethod**: *"none" \| "auto" \| "background"*

The update method the app should use when checking for available updates

___

