Changelog
======
## 5.4.5
* fix(android): make sure parent folders exist on file creation ([#226](https://github.com/ionic-team/cordova-plugin-ionic/pull/226))

## 5.4.4
* Fix issue where too many network requests at once could fire and cause performance issues.

## 5.4.3
* Fix issue where types caused incompatability with Ionic v3 (Typescript 2.x)

## 5.4.0
* Remove cordova-plugin-file as dependency to fix ([#213](https://github.com/ionic-team/cordova-plugin-ionic/issues/213))

## 5.3.1
* Add cordova-plugin-whitelist dependency ([#215](https://github.com/ionic-team/cordova-plugin-ionic/pull/215))

## 5.3.0
* Added an 'incompatibleUpdateAvailable' property to the 'CheckForUpdateResponse' ([#204](https://github.com/ionic-team/cordova-plugin-ionic/pull/204))
* 'ConfigurationInfo' now contains the 'BuildId' in addition to the 'SnapshotId' ([#204](https://github.com/ionic-team/cordova-plugin-ionic/pull/204))

## 5.2.9
* Get dataDirectory from getAppInfo function ([#197](https://github.com/ionic-team/cordova-plugin-ionic/pull/197))
* Add proxy for browser platform to support it ([#199](https://github.com/ionic-team/cordova-plugin-ionic/pull/199))

## 5.2.8
* Fix Type Error in IDeployConfig ([#196](https://github.com/ionic-team/cordova-plugin-ionic/pull/196))

## 5.2.7
* Change hook to run before_prepare and make it async ([#178](https://github.com/ionic-team/cordova-plugin-ionic/pull/178))
* Fixed bug where the a new binary update would load an older cached version of the app ([#179)](https://github.com/ionic-team/cordova-plugin-ionic/issues/179))

## 5.2.6
* Check for Capacitor and switch folder ([#164](https://github.com/ionic-team/cordova-plugin-ionic/pull/164))
* Remove unused import ([#163](https://github.com/ionic-team/cordova-plugin-ionic/pull/163))
* Delay device ready until pro checks are done ([#161](https://github.com/ionic-team/cordova-plugin-ionic/pull/161))

## 5.2.5
* Fix bug where binaryVersionName and binaryVersionCode are not returned from getConfiguation call
* Fix bug where downloadUpdate progress call back would go from 0 to 50 rather than 100 ([#156](https://github.com/ionic-team/cordova-plugin-ionic/pull/156]))
* Check if the device is online before checking for updates ([#154](https://github.com/ionic-team/cordova-plugin-ionic/pull/154))

## 5.2.4
* update check device resp to be accurate ([#148](https://github.com/ionic-team/cordova-plugin-ionic/pull/148))

## 5.2.3

* Fixed bug with AndroidManifest.xml syntax for real since our release script kept breaking it

## 5.2.2

* Fixed bug with AndroidManifest.xml syntax

## 5.2.1

* Add ACCESS_NETWORK_STATE permission to make navigator.onLine work on android

## 5.2.0

* Added `DisableDeploy` Cordova preference allowing disabling of the plugin
* Requires `cordova-plugin-ionic-webview@^2.1.4` for `DisableDeploy` support to work correctly

## 5.1.6

* Fixed a bug with none update method strategy that could cause background updates upon resume of the app from background

## 5.0.6

* Fixed a bug with version rebulds that could make some initial redirects take up to 15 seconds.

## 5.0.5

* Rebuild a deploy directory in the case where the binary version has changed since the update was downloaded.

# 5.0.0

* Release!
* Misc. bugfixes from rc3

## 5.0.0-rc.3

* Improved dev tools

## 5.0.0-rc.2

* Disable certain features if browser `fetch` is unavailable
* Update some API methods for coherent returns

## 5.0.0-rc.1

* Removed the switch statement in Android Native code to support older Java platforms

## 5.0.0-rc.0

* Removed the deprecated API, to be added to version 4.2.0

## 5.0.0-alpha.0

* Rewrote the plugin in Typescript.
* Added support for application file manifests.
* Added full support for partial update downloads, greatly decreasing network bandwidth.
* **Deprecated old plugin API** in favor of modern promise-based API using async/await.  Existing methods are still available, but may be removed in the future.

## 4.1.7

* Fix a redirect bug in iOS that would give the `background` update method inconsistent behavior

## 4.1.6

* Fix redirect bug in extract when version already exists (PR #82)

## 4.1.5

* Fix UUID storage bug on iOS (PR #79)

## 4.1.4

* Fix `checkAndApply` bug on Android (PR #77)

## 4.1.3

* Fix broken release (4.1.2)

## 4.1.2

* Handle `partial` flag from Pro API in `check-device` endpoint.

## 4.1.1

* Send plugin version to Ionic Pro when checking for updates.

## 4.1.0

* Added support for partial downloads.

## 4.0.1

* Fixed a bug where `deleteVersion` would errorwhen called. (PR #63)

# 4.0.0

* Removed some extraneous plugin result calls.
* **BREAKING** Unified all API functions to return `true` on success.

## 3.1.3

* Fixed a bug where `ng-cordova` could potentially be overwritten when a deploy is applied.
* Update no-zip branch

## 3.1.2

* Fixed the extract callback value
* Fixed a bug where the splashscreen would show for long periods while using the `background` update method on Android

## 3.1.1

* Fixed another issue with the cordova.js regex.

## 3.1.0

* Added a `WARN_DEBUG` flag to allow bypass of the debug dialog. (PR $49)
* Fixed a bug where minified script tags could be overwritten.
* Fixed a bug where redirect could error incorrectly on Android.

# 3.0.0

* Updated Cordova Splashscreen dependency (PR #41)
* Fixed the callback responses from the `download` and `extract` functions to reflect the docs.
* Store updates to plugin config make via the `init` methods in preferences.

## 2.0.4

* Added a supported platforms note (PR #33)
* Added correct callback calld for initialize and redirect methods (PR #20)

## 2.0.3

* Fixed a bug where the splashscreen could hang in some cases when dismissing the debug dialog within the automatic update methods on Android.

## 2.0.2

* Fixed a bug where the splashscreen could hang in some cases when using the `background` update method on Android.

## 2.0.1

* Fixed a bug with the splashscreen dependency definition

# 2.0.0

* **BREAKING** Refactored the deploy plugin API to take a config object at `init`, but no longer needs app ID's/channels in individual calls.
* Fixed a bug where the splashscreen was hiding before the deploy had finished on iOS.
* Fixed an iOS bug where redirects were failing as a result of a regex comparison.
* Fixed `auto` update method in Android to properly show the splash screen.
* Streamlined the way debug builds are handled.  The plugin will now ask before each redirect away from the bundled version, allowing easier local development.

## 1.1.9

* Track channel.
* Add ability to clear debug dialog.

## 1.1.8

* Hooked up the `MAX_STORE` variable.

## 1.1.7

* When the app is a `DEBUG` build, the deploy feature will show a prompt and ask whether to apply updates

## 1.1.6

* Fixed a bug with `auto` mode when versions were already present.
* Added `MAX_STORE` flag for future use.
* Changed default behavior to `background` downloads.

## 1.1.5

* Added this changelog and updated the README

## 1.1.4

* Added background download flags and changed `AUTO_UPDATE` config to `UPDATE_METHOD`
