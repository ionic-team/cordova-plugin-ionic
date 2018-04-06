#!/bin/bash
set -o errexit
set -o nounset

# Stop CLI prompts and init config vars
APP_ID=${IONIC_APP_ID:-6cda5a01}
CHANNEL=${IONIC_CHANNEL:-Production}
CI=1
UPDATE_METHOD=${IONIC_UPDATE_METHOD:-none}

# Build the plugin ts
npm run build

# Create a blank ionic app cd
ionic start tmp blank --type=ionic-angular --pro-id=${APP_ID} --cordova
cp apply-changes.sh tmp/apply-changes.sh
cd tmp

# Add cordova platform and install the plugin
cordova platform add ios
cordova plugin add .. --save --variable APP_ID="${APP_ID}" --variable CHANNEL_NAME="${CHANNEL}" --variable UPDATE_METHOD="${UPDATE_METHOD}" --variable WARN_DEBUG="false" --link
cordova prepare ios

# watch for new changes
npm run watch
