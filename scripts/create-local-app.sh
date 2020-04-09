#!/bin/bash
set -o errexit
set -o nounset

# Stop CLI prompts and init config vars
APP_ID=${IONIC_APP_ID:-2de70dab}
APP_NAME=${IONIC_APP_NAME:-testapp}
CHANNEL=${IONIC_CHANNEL:-Master}
CI=1
UPDATE_METHOD=${IONIC_UPDATE_METHOD:-auto}
BACKGROUND_DURATION=${IONIC_BACKGROUND_DURATION:-1}

# Build the plugin ts
npm run build

# Create a blank ionic app cd
cd ..
ionic start ${APP_NAME} blank --type=ionic-angular --cordova
cd ${APP_NAME}
npm run build

# Add cordova platform and install the plugin
cordova platform add ios@latest
cordova platform add android@latest
cordova plugin add ../cordova-plugin-ionic --save \
--variable MIN_BACKGROUND_DURATION="$BACKGROUND_DURATION" \
--variable APP_ID="${APP_ID}" \
--variable CHANNEL_NAME="${CHANNEL}" \
--variable UPDATE_METHOD="${UPDATE_METHOD}" --link
cordova prepare ios
cordova prepare android
