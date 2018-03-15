Changelog
======

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
