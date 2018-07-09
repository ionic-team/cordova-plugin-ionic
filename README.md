Ionic Cordova SDK
======

Supported platforms: iOS, Android

## Setup

```bash
cordova plugin add cordova-plugin-ionic@beta --save --variable APP_ID="abcd1234" --variable CHANNEL_NAME="Master" --variable UPDATE_METHOD="background"
```

The plugin will be available on `window` as `IonicCordova`

The beta version of the plugin relies on the newest version of  `cordova-plugin-ionic-webview` you may need to remove
the older version and update with the `beta` version.

```bash
cordova plugin rm cordova-plugin-ionic-webview
cordova plugin add cordova-plugin-ionic-webview@beta
```

## Live Updates

### Cordova Install Variables

* `APP_ID` **Required** - Your Ionic Pro app ID
* `CHANNEL_NAME` **Required** - The channel to check for updates from
* `WARN_DEBUG` - Set false if you do not want the check when apk/ipa is in debug mode.
* `UPDATE_API` - The location of the Ionic Pro API (only change this for development)
* `UPDATE_METHOD` - `auto`, `background`, or `none`.  Dictates the behavior of the plugin.  `auto` will download and apply the latest update on app start, potentially leading to long splash screen loads if the connection is slow.  `background` will only download the update in the background on app start, but will allow full functionality while doing so, only redirecting users the _next_ time the app is loaded.  `none` will do nothing, leaving full plugin functionality in the hands of the developer.  **Default is `background`**
* `MAX_STORE` - The maximum number of downloaded versions to store on the device for quick loading.  More versions means less downloading, but can increase the app size greatly.  **Default is 3 (Defaults is 2 in V5)**
* `MIN_BACKGROUND_DURATION` - The minimum duration in seconds after which the app in background checks for an update. **Default is 30 (New in V5)**
* `ROLLBACK_TIMEOUT` - The number seconds until the app will roll back to the bundle version if a broken deploy is installed. **Default is 10 (New in V5)**

### Cordova API

* `IonicCordova.deploy.init(config, success, failure)` - Initializes the plugin with an app ID and API host specified in js-land.  Can be used to change these variables at runtime.
* `IonicCordova.deploy.check(success, failure)` - Check for updates from a specified channel, will change the saved channel from the install step.
* `IonicCordova.deploy.download(success, failure)` - If an update is present, download it.
* `IonicCordova.deploy.extract(success, failure)` - If an update has been downloaded, extract it and set the default redirect location for next app start.
* `IonicCordova.deploy.redirect(success, failure)` - Redirect to the latest version of the app on this device.
* `IonicCordova.deploy.info(success, failure)` - Get info on current version for this device.
* `IonicCordova.deploy.getVersions(success, failure)` - List downloaded versions on this device.
* `IonicCordova.deploy.deleteVersion(uuid, success, failure)` - Delete a downloaded version by UUID from this device.

## API Docs for V5 release

* [IonicCordova](docs/interfaces/_ioniccordova_d_.ipluginbaseapi.md)
* [IonicCordova.deploy](docs/interfaces/_ioniccordova_d_.ideploypluginapi.md)

### External modules


---


## Contributing to this plugin on V5

```bash
npm install
npm run create-dev
```

This will create a blank Ionic app in a local `tmp` directory with the plugin and dependencies installed, and the iOS platform added.  Native plugin code is installed with `--link` and any changes to the typescript in `www` will be copied over into the app's `platforms/ios` and `platforms/android` directories.

### Some other helpful dev commands

```bash
npm run apply-dev
```

Updates the linked plugin in the `tmp` test app with your JavaScript changes

```bash
npm run watch
```

Watches for Typescript changes

```bash
npm run watch-dev
```

Watches for Typescript changes, then runs the `apply-dev` script to propogate them to the testing app.
