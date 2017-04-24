
@objc(IonicCordovaCommon) class IonicCordovaCommon : CDVPlugin {

    override func pluginInitialize() {


    }

    func forceCrash(_ command: CDVInvokedUrlCommand) -> Void {
        let _ = [0][1]
    }

    func checkForPendingCrash(_ command: CDVInvokedUrlCommand) -> Void {
      if let crashReporter = PLCrashReporter.shared() {
        let hasCrash = crashReporter.hasPendingCrashReport()
        let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: hasCrash)
        self.commandDelegate!.send(result, callbackId: command.callbackId)
      }
    }

    func loadPendingCrash(_ command: CDVInvokedUrlCommand) -> Void {
      do {
        let crashData = try PLCrashReporter.shared().loadPendingCrashReportDataAndReturnError()
        let report = try PLCrashReport(data: crashData)

        let reportString = PLCrashReportTextFormatter.stringValue(for: report, with:PLCrashReportTextFormatiOS)


        var info = [String: String]()
        info["details"] = reportString

        let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: info)
        self.commandDelegate!.send(result, callbackId: command.callbackId)
      } catch let error as NSError {
        print("Failed to capture erorr from PLCrashReporter - \(error.description)")
        let result = CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs:"Could not enable crash reporter")
        self.commandDelegate!.send(result, callbackId: command.callbackId)
      }
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
            let platformVersion = UIDevice.current.systemVersion

            var infoDict = [String: String]()
            infoDict["platform"] = "ios"
            infoDict["platformVersion"] = platformVersion
            infoDict["version"] = shortVersionString
            infoDict["bundleName"] = bundleName
            infoDict["bundleVersion"] = bundleVersion

            let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: infoDict)
            self.commandDelegate!.send(result, callbackId: command.callbackId)
        }
    }
}
