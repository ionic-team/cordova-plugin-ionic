#!/bin/bash
set -o errexit
set -o nounset

# Stop CLI prompts and init config vars
APP_ID=${IONIC_APP_ID:-2de70dab}
APP_NAME=${IONIC_APP_NAME:-testapp}
CHANNEL=${IONIC_CHANNEL:-Master}
CI=1
UPDATE_METHOD=${IONIC_UPDATE_METHOD:-auto}

# Build the plugin ts
npm run build

# Create a blank ionic app cd
cd ..
ionic start ${APP_NAME} blank --type=ionic-angular --cordova
cd ${APP_NAME}
npm run build

# Add cordova platform and install the plugin
cordova plugin rm cordova-plugin-ionic-webview
cordova plugin add cordova-plugin-ionic-webview@v2.0.0-beta.1
cordova platform add ios@latest
cordova platform add android@latest
cordova plugin add ../cordova-plugin-ionic --save --variable APP_ID="${APP_ID}" --variable CHANNEL_NAME="${CHANNEL}" --variable UPDATE_METHOD="${UPDATE_METHOD}" --variable WARN_DEBUG="false" --link
cordova prepare ios
cordova prepare android
