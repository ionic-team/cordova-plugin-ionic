
@objc(IonicCordovaCommon) class IonicCordovaCommon : CDVPlugin {

    override func pluginInitialize() {
    }

    func getAppInfo(_ command: CDVInvokedUrlCommand) -> Void {
        if let info = Bundle.main.infoDictionary {

            let shortVersionString = info["CFBundleShortVersionString"] as? String
            //let bundleName = info["CFBundleName"] as? String
            let bundleVersion = info["CFBundleVersion"] as? String
            let bundleIdentifier = Bundle.main.bundleIdentifier
            let platformVersion = UIDevice.current.systemVersion

            var infoDict = [String: String]()
            infoDict["platform"] = "ios"
            infoDict["platformVersion"] = platformVersion
            infoDict["version"] = shortVersionString
            infoDict["bundleName"] = bundleIdentifier
            infoDict["bundleVersion"] = bundleVersion

            let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: infoDict)
            self.commandDelegate!.send(result, callbackId: command.callbackId)
        }
    }
}
