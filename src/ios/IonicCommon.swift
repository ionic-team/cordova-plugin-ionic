@objc(IonicCommon) class IonicCommon : CDVPlugin {

    override func pluginInitialize() {
    }

    func getAppInfo(_ command: CDVInvokedUrlCommand) -> CDVPluginResult {
        if let info = Bundle.main.infoDictionary? {
            let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAsDictionary: info)
            return result!
        }

        let result = CDVPluginResult(status: CDVCommandStatus_OK)
        return result!
    }
}
