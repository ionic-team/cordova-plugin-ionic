Ionic Cordova SDK
======

## Setup

```bash
cordova plugin add cordova-plugin-ionic --save --variable APP_ID="512a1405" --variable CHANNEL_NAME="Master"
```

The plugin will be available on `window` as `IonicCordova`

## Live Updates

### Cordova Install Variables

* `APP_ID` **Required** - Your Ionic Pro app ID
* `CHANNEL_NAME` **Required** - The channel to check for updates from
* `UPDATE_API` - The location of the Ionic Pro API (only change this for development)
* `UPDATE_METHOD` - `auto`, `background`, or `none`.  Dictates the behavior of the plugin.  `auto` will download and apply the latest update on app start, potentially leading to long splash screen loads if the connection is slow.  `background` will only download the update in the background on app start, but will allow full functionality while doing so, only redirecting users the _next_ time the app is loaded.  `none` will do nothing, leaving full plugin functionality in the hands of the developer.  **Default is `auto`**
* `MAX_VERSIONS` - The maximum number of downloaded versions to store on the device for quick loading.  More versions means less downloading, but can increase the app size greatly.  **Default is 3**

### Cordova API

* `IonicCordova.deploy.init(app_id, server_host, success, failure)` - Initializes the plugin with an app ID and API host specified in js-land.  Can be used to change these variables at runtime.
* `IonicCordova.deploy.check(app_id, channel_tag, success, failure)` - Check for updates from a specified channel, will change the saved channel from the install step.
* `IonicCordova.deploy.download(app_id, success, failure)` - If an update is present, download it.
* `IonicCordova.deploy.extract(app_id, success, failure)` - If an update has been downloaded, extract it and set the default redirect location for next app start.
* `IonicCordova.deploy.redirect(app_id, success, failure)` - Redirect to the latest version of the app on this device.
* `IonicCordova.deploy.info(app_id, success, failure)` - Get info on current version for this device.
* `IonicCordova.deploy.getVersions(app_id, success, failure)` - List downloaded versions on this device.
* `IonicCordova.deploy.deleteVersion(app_id, uuid, success, failure)` - Delete a downloaded version by UUID from this device.

