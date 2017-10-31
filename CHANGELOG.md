Changelog
======

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