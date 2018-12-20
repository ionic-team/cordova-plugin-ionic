function notSupported(win,fail) {
    console.log('IonicCordova is not supported on browser platform');
    setTimeout(function(){
        if (win) {
            win();
        }
    },0);
}

function getPreferences(win,fail) {
    setTimeout(function(){
        win({
            minBackgroundDuration: 30,
            disabled: true
        });
    },0);
}

module.exports = {
    getPreferences: getPreferences,
    getAppInfo: notSupported,
    setPreferences:notSupported,
    configure: notSupported
};

require("cordova/exec/proxy").add("IonicCordovaCommon", module.exports);


