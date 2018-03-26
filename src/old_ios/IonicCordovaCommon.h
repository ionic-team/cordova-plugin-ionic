#import <Cordova/CDVPlugin.h>

@interface IonicCordovaCommon : CDVPlugin

- (void)getAppInfo:(CDVInvokedUrlCommand*)command;

- (void) getPreferences:(CDVInvokedUrlCommand *)command;

@end
