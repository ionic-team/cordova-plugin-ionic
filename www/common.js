var exec = require('cordova/exec');

var IonicCordovaCommon = {
  getAppInfo: function(success, fail) {
    exec(success, fail, "IonicCordovaCommon", "getAppInfo");
  }
}

module.exports = IonicCordovaCommon;
