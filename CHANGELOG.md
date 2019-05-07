## Change Log

### 5.4.0
* Added Deploy API Imports

### 5.3.0
* Added an 'incompatibleUpdateAvailable' property to the 'CheckForUpdateResponse' ([#204] (https://github.com/ionic-team/cordova-plugin-ionic/pull/204))
* 'ConfigurationInfo' now contains the 'BuildId' in addition to the 'SnapshotId' ([#204] (https://github.com/ionic-team/cordova-plugin-ionic/pull/204))

### 5.2.9
* Get dataDirectory from getAppInfo function ([#197](https://github.com/ionic-team/cordova-plugin-ionic/pull/197))
* Add proxy for browser platform to support it ([#199](https://github.com/ionic-team/cordova-plugin-ionic/pull/199))

### 5.2.8
* Fix Type Error in IDeployConfig ([#196](https://github.com/ionic-team/cordova-plugin-ionic/pull/196))

### 5.2.7
* Change hook to run before_prepare and make it async ([#178](https://github.com/ionic-team/cordova-plugin-ionic/pull/178))
* Fixed bug where the a new binary update would load an older cached version of the app ([#179)](https://github.com/ionic-team/cordova-plugin-ionic/issues/179))

### 5.2.6
* Check for Capacitor and switch folder ([#164](https://github.com/ionic-team/cordova-plugin-ionic/pull/164))
* Remove unused import ([#163](https://github.com/ionic-team/cordova-plugin-ionic/pull/163))
* Delay device ready until pro checks are done ([#161](https://github.com/ionic-team/cordova-plugin-ionic/pull/161))

### 5.2.5
* Fix bug where binaryVersionName and binaryVersionCode are not returned from getConfiguation call
* Fix bug where downloadUpdate progress call back would go from 0 to 50 rather than 100 ([#156](https://github.com/ionic-team/cordova-plugin-ionic/pull/156]))
* Check if the device is online before checking for updates ([#154](https://github.com/ionic-team/cordova-plugin-ionic/pull/154))

### 5.2.4
* update check device resp to be accurate ([#148](https://github.com/ionic-team/cordova-plugin-ionic/pull/148))

### 5.2.3

* Fixed bug with AndroidManifest.xml syntax for real since our release script kept breaking it

### 5.2.2

* Fixed bug with AndroidManifest.xml syntax

### 5.2.1

* Add ACCESS_NETWORK_STATE permission to make navigator.onLine work on android

### 5.2.0

* Added `DisableDeploy` Cordova preference allowing disabling of the plugin
* Requires `cordova-plugin-ionic-webview@^2.1.4` for `DisableDeploy` support to work correctly

### 5.1.6

* Fixed a bug with none update method strategy that could cause background updates upon resume of the app from background

### 5.0.6

* Fixed a bug with version rebulds that could make some initial redirects take up to 15 seconds.

### 5.0.5

* Rebuild a deploy directory in the case where the binary version has changed since the update was downloaded.

### 5.0.0

* Release!
