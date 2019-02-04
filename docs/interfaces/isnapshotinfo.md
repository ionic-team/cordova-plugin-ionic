[Cordova Plugin Ionic](../../README.md)

# Interface: ISnapshotInfo

Information about a snapshot

## Hierarchy

**ISnapshotInfo**

## Index

### Properties

* [binaryVersion](isnapshotinfo.md#binaryversion)
* [binaryVersionCode](isnapshotinfo.md#binaryversioncode)
* [binaryVersionName](isnapshotinfo.md#binaryversionname)
* [binary_version](isnapshotinfo.md#binary_version)
* [buildId](isnapshotinfo.md#buildid)
* [channel](isnapshotinfo.md#channel)
* [deploy_uuid](isnapshotinfo.md#deploy_uuid)
* [versionId](isnapshotinfo.md#versionid)

---

## Properties

<a id="binaryversion"></a>

###  binaryVersion

**● binaryVersion**: *`string`*

*__deprecated__*: The binary version the snapshot was downloaded for. The versionName on Android or CFBundleShortVersionString on iOS this is the end user readable version listed on the stores.

___
<a id="binaryversioncode"></a>

###  binaryVersionCode

**● binaryVersionCode**: *`string`*

The binary version build code the snapshot was downloaded for. The versionCode on Android or CFBundleVersion on iOS this should be changed every time you do a new build debug or otherwise.

___
<a id="binaryversionname"></a>

###  binaryVersionName

**● binaryVersionName**: *`string`*

The binary version name the snapshot was downloaded for. The versionName on Android or CFBundleShortVersionString on iOS this is the end user readable version listed on the stores.

___
<a id="binary_version"></a>

###  binary_version

**● binary_version**: *`string`*

*__deprecated__*: in favor of [binaryVersion](#binaryversion)

The binary version the snapshot was downloaded for.

___
<a id="buildid"></a>

###  buildId

**● buildId**: *`string`*

The id for the snapshot.

___
<a id="channel"></a>

###  channel

**● channel**: *`string`*

The channel that the snapshot was downloaded for..

___
<a id="deploy_uuid"></a>

###  deploy_uuid

**● deploy_uuid**: *`string`*

*__deprecated__*: in favor of [versionId](#versionid)

The id for the snapshot.

___
<a id="versionid"></a>

###  versionId

**● versionId**: *`string`*

The id for the snapshot.

___

