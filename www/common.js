var exec = require('cordova/exec');

var IonicCordovaCommon = {
  enableCrashLogging: function(success, fail) {
    exec(success, fail, "IonicCordovaCommon", "enableCrashLogging");
  },
  forceCrash: function(success, fail) {
    exec(success, fail, "IonicCordovaCommon", "forceCrash");
  },
  getAppInfo: function(success, fail) {
    exec(success, fail, "IonicCordovaCommon", "getAppInfo");
  }
}

module.exports = IonicCordovaCommon;
