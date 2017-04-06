
@objc(IonicCordovaCommon) class IonicCordovaCommon : CDVPlugin {

    override func pluginInitialize() {


    }

    func forceCrash(_ command: CDVInvokedUrlCommand) -> Void {
        let _ = [0][1]
    }

    func enableCrashLogging(_ command: CDVInvokedUrlCommand) -> Void {
      print("Enable crash logging!")
      let result: CDVPluginResult;

      do {
        try PLCrashReporter.shared().enableAndReturnError()
        result = CDVPluginResult(status: CDVCommandStatus_OK)
      } catch let error as NSError {
        print("Failed to enable PLCrashReporter - \(error.description)")
        result = CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs:"Could not enable crash reporter" )
      }

      self.commandDelegate!.send(result, callbackId: command.callbackId)
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
