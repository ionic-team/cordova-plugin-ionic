Ionic Cordova SDK
======

Supported platforms: iOS, Android

## Setup

```bash
cordova plugin add cordova-plugin-ionic --save --variable APP_ID="abcd1234" --variable CHANNEL_NAME="Master" --variable UPDATE_METHOD="background"
```

The plugin will be available on `window` as `IonicCordova`

**NOTE**: The plugin delays the cordova ready event until it finish checking for updates and add this preference to the app `<preference name="AutoHideSplashScreen" value="false"/>`, which makes the Splash Screen to not go away automatically. All Ionic templates run `this.splashScreen.hide();` on cordova ready event, but if it was removed it should be added back. Alternatively the app can add `<preference name="AutoHideSplashScreen" value="true"/>` to override the value added by the plugin, but that can lead to the Splash Screen going away before the download is complete.

## Live Updates

### Cordova Install Variables

* `APP_ID` **Required** - Your Ionic Pro app ID
* `CHANNEL_NAME` **Required** - The channel to check for updates from
* `UPDATE_API` - The location of the Ionic Pro API (only change this for development)
* `UPDATE_METHOD` - `auto`, `background`, or `none`.  Dictates the behavior of the plugin.  `auto` will download and apply the latest update on app start, potentially leading to long splash screen loads if the connection is slow.  `background` will only download the update in the background on app start, but will allow full functionality while doing so, only redirecting users the _next_ time the app is loaded.  `none` will do nothing, leaving full plugin functionality in the hands of the developer.  **Default is `background`**
* `MAX_STORE` - The maximum number of downloaded versions to store on the device for quick loading.  More versions means less downloading, but can increase the app size greatly.  **Default is 3 (Defaults is 2 in V5)**
* `MIN_BACKGROUND_DURATION` - The minimum duration in seconds after which the app in background checks for an update. **Default is 30 (New in V5)**

### Preferences

* `DisableDeploy` - Default value is `false`.

Allows to disable deploy updates by adding this preference in the config.xml

```
<preference name="DisableDeploy" value="true" />
```

## API Docs

* [IonicCordova](docs/interfaces/ipluginbaseapi.md)
* [IonicCordova.deploy](docs/interfaces/ideploypluginapi.md)

### External modules


---


## Contributing to this plugin

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
