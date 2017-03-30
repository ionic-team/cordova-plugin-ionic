@objc(IonicCordovaCommon) class IonicCordovaCommon : CDVPlugin {

    override func pluginInitialize() {
    }

    func getAppInfo(_ command: CDVInvokedUrlCommand) -> Void {
        if let info = Bundle.main.infoDictionary {
            
            let shortVersionString = info["CFBundleShortVersionString"] as? String
            let bundleName = info["CFBundleName"] as? String
            let bundleVersion = info["CFBundleVersion"] as? String
            
            var infoDict = [String: String]()
            infoDict["version"] = shortVersionString
            infoDict["bundleName"] = bundleName
            infoDict["bundleVersion"] = bundleVersion
            
            let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: infoDict)
            self.commandDelegate!.send(result, callbackId: command.callbackId)
        }
    }
}
