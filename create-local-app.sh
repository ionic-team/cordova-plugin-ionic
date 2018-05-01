#!/bin/bash
set -o errexit
set -o nounset

# Stop CLI prompts and init config vars
APP_ID=${IONIC_APP_ID:-2de70dab}
CHANNEL=${IONIC_CHANNEL:-Master}
CI=1
UPDATE_METHOD=${IONIC_UPDATE_METHOD:-auto}

# Build the plugin ts
npm run build

# Create a blank ionic app cd
ionic start tmp blank --type=ionic-angular --pro-id=${APP_ID} --cordova
cd tmp
npm run build

# Add cordova platform and install the plugin
cordova platform add ios
cordova platform add android
cordova plugin add .. --save --variable APP_ID="${APP_ID}" --variable CHANNEL_NAME="${CHANNEL}" --variable UPDATE_METHOD="${UPDATE_METHOD}" --variable WARN_DEBUG="false" --link
cordova prepare ios
cordova prepare android
