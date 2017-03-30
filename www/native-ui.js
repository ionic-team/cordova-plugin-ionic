var exec = require('cordova/exec');

var IonicNativeUI = {
  push: function(success, fail) {
    exec(success, fail, "IonicNativeUI", "push", []);
  },

  pop: function(success, fail) {
    exec(success, fail, "IonicNativeUI", "pop", []);
  },

  action: function(success, fail, actionName, args) {
    exec(success, fail, "IonicNativeUI", "action", [actionName, args]);
  },

  onNavPop: function(success, fail) {
    exec(success, fail, "IonicNativeUI", "onNavPop");
  }
}

document.addEventListener('deviceReady', function() {
}, false);
module.exports = IonicNativeUI;
