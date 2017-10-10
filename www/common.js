var exec = require('cordova/exec');

/**
 * LIVE UPDATE API
 *
 * The plugin API for the live updates feature.
 */
var IonicDeploy = {
  init: function(config, success, failure) {
    if (typeof config !== 'string') {
      config = JSON.stringify(config);
    }
    exec(success, failure, 'IonicDeploy', 'initialize', [config]);
  },
  debug: function(success, failure) {
    exec(success, failure, 'IonicDeploy', 'showDebug');
  },
  clearDebug: function(success, failure) {
    exec(success, failure, 'IonicDeploy', 'clearDebug');
  },
  check: function(success, failure) {
    exec(success, failure, 'IonicDeploy', 'check');
  },
  download: function(success, failure) {
  	exec(success, failure, 'IonicDeploy', 'download');
  },
  extract: function(success,failure) {
    exec(success, failure, 'IonicDeploy', 'extract');
  },
  redirect: function(success, failure) {
  	exec(success, failure, 'IonicDeploy', 'redirect');
  },
  info: function(success, failure) {
    exec(success, failure, 'IonicDeploy', 'info');
  },
  getVersions: function(success, failure) {
    exec(success, failure, 'IonicDeploy', 'getVersions');
  },
  deleteVersion: function(version, success, failure) {
    exec(success, failure, 'IonicDeploy', 'deleteVersion', [version]);
  },
  parseUpdate: function(jsonResponse, success, failure) {
    if (typeof jsonReponse !== 'string') {
      jsonResponse = JSON.stringify(jsonResponse);
    }
    exec(success, failure, 'IonicDeploy', 'parseUpdate', [jsonResponse]);
  },
};

/**
 * BASE API
 *
 * All features of the Ionic Cordova plugin are registered here, along with some low level error tracking features used
 * by the monitoring service.
 */
var IonicCordova = {
  enableCrashLogging: function(success, fail) {
    exec(success, fail, "IonicCordovaCommon", "enableCrashLogging");
  },
  checkForPendingCrash: function(success, fail) {
    exec(success, fail, "IonicCordovaCommon", "checkForPendingCrash");
  },
  loadPendingCrash: function(success, fail) {
    exec(success, fail, "IonicCordovaCommon", "loadPendingCrash");
  },
  forceCrash: function(success, fail) {
    exec(success, fail, "IonicCordovaCommon", "forceCrash");
  },
  getAppInfo: function(success, fail) {
    exec(success, fail, "IonicCordovaCommon", "getAppInfo");
  },
  deploy: IonicDeploy
};

/**
 * DEBUG DIALOG
 *
 * Right now this is just used for live updates, but all manner of functionality could be added in the case where the
 * app is a debug build.
 */
function onDeviceReady() {
  IonicCordova.deploy.debug(function(success) {
    console.log("SUCCESS", success);
  }, function(fail) {
    console.log("FAIL", fail);
  })
}
document.addEventListener("deviceready", onDeviceReady, false);

module.exports = IonicCordova;
