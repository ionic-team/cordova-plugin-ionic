#import "IonicCordovaCommon.h"
#import <Cordova/CDVPluginResult.h>
#import <objc/message.h>


@interface IonicCordovaCommon()

@property Boolean revertToBase;
@property NSString *baseIndexPath;

@end

@implementation IonicCordovaCommon

+ (BOOL) shouldShowSplash {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    return [prefs boolForKey:@"downloading_update"];
}

- (void) pluginInitialize {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];

    self.revertToBase = true;
    self.baseIndexPath = [[NSBundle mainBundle] pathForResource:@"www/index" ofType:@"html"];

    [prefs setBool:YES forKey:@"downloading_update"];
    [prefs synchronize];

    // Kick off a timer to revert broken updates
    int rollbackTimeout = [[[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonRollbackTimeout"] intValue];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (uint64_t) rollbackTimeout * NSEC_PER_SEC), dispatch_get_main_queue(), CFBridgingRelease(CFBridgingRetain(^(void) {
        // TODO: Reimplement using new setServerBasePath() method in webview plugin
        // [self loadInitialVersion:NO];
    })));
}

- (void) clearSplashFlag:(CDVInvokedUrlCommand*)command {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    [prefs setBool:NO forKey:@"downloading_update"];
    [prefs synchronize];  

    NSLog(@"Cleared splash flag.");
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"success"] callbackId:command.callbackId];
}

- (void) clearRevertTimer:(CDVInvokedUrlCommand*)command {
    self.revertToBase = false;

    NSLog(@"Cleared revert flag.");
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"success"] callbackId:command.callbackId];
}

- (void) getAppInfo:(CDVInvokedUrlCommand*)command {
    NSMutableDictionary *json = [[NSMutableDictionary alloc] init];
    NSString* platformVersion = [[UIDevice currentDevice] systemVersion];
    NSString* version = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleVersion"];
    NSString* bundleName = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleIdentifier"];
    NSString* bundleVersion = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];

    if (bundleVersion == nil) {
      bundleVersion = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleVersion"];
      if (bundleVersion == nil) {
        bundleVersion = @"";
      }
    }
    [json setObject:@"ios" forKey:@"platform"];
    [json setObject:platformVersion forKey:@"platformVersion"];
    [json setObject:version forKey:@"version"];
    [json setObject:bundleName forKey:@"bundleName"];
    [json setObject:bundleVersion forKey:@"bundleVersion"];

    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:json] callbackId:command.callbackId];

}

- (void) getPreferences:(CDVInvokedUrlCommand*)command {
    // Get preferences
    NSString *appId = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonAppId"]];
    NSString *debug = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonDebug"]];
    NSString *host = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonApi"]];
    NSString *updateMethod = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonUpdateMethod"]];
    NSString *channel = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonChannelName"]];
    NSNumber *maxV = [NSNumber numberWithInt:[[[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonMaxVersions"] intValue]];
    NSNumber *minBackgroundDuration = [NSNumber numberWithInt:[[[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonMinBackgroundDuration"] intValue]];

    // Build the preferences json object
    NSMutableDictionary *json = [[NSMutableDictionary alloc] init];
    [json setObject:appId forKey:@"appId"];
    [json setObject:debug forKey:@"debug"];
    [json setObject:channel forKey:@"channel"];
    [json setObject:host forKey:@"host"];
    [json setObject:updateMethod forKey:@"updateMethod"];
    [json setObject:maxV forKey:@"maxVersions"];
    [json setObject:minBackgroundDuration forKey:@"minBackgroundDuration"];
    NSLog(@"Got app preferences: %@", json);

    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:json] callbackId:command.callbackId];
}

- (void) loadInitialVersion:(BOOL)force {
    if (force || self.revertToBase) {
        [self loadInitialVersion];
    }
}

- (void) loadInitialVersion {
    NSLog(@"Redirecting to bundled index.html");
    // TODO: If this happens we need to recorde the broken versionId somehow so we don't
    // reattempt to load it later.
    dispatch_async(dispatch_get_main_queue(), ^(void) {
        NSLog(@"Reloading the web view.");
        SEL reloadSelector = NSSelectorFromString(@"reload");
        ((id (*)(id, SEL))objc_msgSend)(self.webView, reloadSelector);
        [self.webViewEngine loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:self.baseIndexPath]]];
    });
}

@end
