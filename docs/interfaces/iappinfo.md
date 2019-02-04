[Cordova Plugin Ionic](../../README.md)

# Interface: IAppInfo

Information about the application.

## Hierarchy

**IAppInfo**

## Index

### Properties

* [binaryVersionCode](iappinfo.md#binaryversioncode)
* [binaryVersionName](iappinfo.md#binaryversionname)
* [bundleName](iappinfo.md#bundlename)
* [bundleVersion](iappinfo.md#bundleversion)
* [dataDirectory](iappinfo.md#datadirectory)
* [device](iappinfo.md#device)
* [platform](iappinfo.md#platform)
* [platformVersion](iappinfo.md#platformversion)
* [version](iappinfo.md#version)

---

## Properties

<a id="binaryversioncode"></a>

###  binaryVersionCode

**● binaryVersionCode**: *`string` \| `number`*

The versionCode on Android or CFBundleVersion on iOS this should be changed every time you do a new build debug or otherwise.

___
<a id="binaryversionname"></a>

###  binaryVersionName

**● binaryVersionName**: *`string`*

The versionName on Android or CFBundleShortVersionString on iOS this is the end user readable version listed on the stores.

___
<a id="bundlename"></a>

###  bundleName

**● bundleName**: *`string`*

The bundle name.

___
<a id="bundleversion"></a>

###  bundleVersion

**● bundleVersion**: *`string`*

*__deprecated__*: The versionName on Android or CFBundleShortVersionString on iOS this is the end user readable version listed on the stores.

___
<a id="datadirectory"></a>

###  dataDirectory

**● dataDirectory**: *`string`*

Directory where the snapshots are stored

___
<a id="device"></a>

###  device

**● device**: *`string`*

A generated device ID (NOT a native device ID)

___
<a id="platform"></a>

###  platform

**● platform**: *"ios" \| "android"*

The platform that the app is currently installed on.

___
<a id="platformversion"></a>

###  platformVersion

**● platformVersion**: *`string`*

The version of the native platform.

___
<a id="version"></a>

###  version

**● version**: *`string`*

*__deprecated__*: The versionCode on Android or CFBundleVersion on iOS this should be changed every time you do a new build debug or otherwise.

___

