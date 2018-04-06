#!/bin/bash

# local sync scripts in local app
# local install command
cordova plugin rm cordova-plugin-ionic
cordova plugin add ~/work/cordova-plugin-ionic --save --variable APP_ID="6cda5a01" --variable CHANNEL_NAME="Production" --variable UPDATE_METHOD="none" --variable WARN_DEBUG="false" --link
cordova prepare ios

# local manual "watch" script
set -o errexit
cp plugins/cordova-plugin-ionic/dist/* platforms/ios/www/plugins/cordova-plugin-ionic/dist/
sed -i '' 's/"use strict"/cordova.define("cordova-plugin-ionic.common", function(require, exports, module) {"use strict"/' platforms/ios/www/plugins/cordova-plugin-ionic/dist/common.js
sed -i '' 's/"use strict"/cordova.define("cordova-plugin-ionic.guards", function(require, exports, module) {"use strict"/' platforms/ios/www/plugins/cordova-plugin-ionic/dist/guards.js
echo '});' >> platforms/ios/www/plugins/cordova-plugin-ionic/dist/common.js
echo '});' >> platforms/ios/www/plugins/cordova-plugin-ionic/dist/guards.js
