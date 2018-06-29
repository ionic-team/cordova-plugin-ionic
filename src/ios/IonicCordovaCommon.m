#import "IonicCordovaCommon.h"
#import <Cordova/CDVWebViewEngineProtocol.h>
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
    self.baseIndexPath = [[NSBundle mainBundle] pathForResource:@"www" ofType: nil];

    if ([prefs stringForKey:@"uuid"] == nil) {
        [prefs setObject:[[NSUUID UUID] UUIDString] forKey:@"uuid"];
    }
    [prefs setBool:YES forKey:@"downloading_update"];
    [prefs synchronize];
}

- (void) clearSplashFlag:(CDVInvokedUrlCommand*)command {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    [prefs setBool:NO forKey:@"downloading_update"];
    [prefs synchronize];

    NSLog(@"Cleared splash flag.");
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"success"] callbackId:command.callbackId];
}

- (void) getAppInfo:(CDVInvokedUrlCommand*)command {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSMutableDictionary *json = [[NSMutableDictionary alloc] init];
    NSString* platformVersion = [[UIDevice currentDevice] systemVersion];
    NSString* version = [[NSBundle mainBundle] infoDictionary][@"CFBundleVersion"];
    NSString* bundleName = [[NSBundle mainBundle] infoDictionary][@"CFBundleIdentifier"];
    NSString* bundleVersion = [[NSBundle mainBundle] infoDictionary][@"CFBundleShortVersionString"];
    NSString* uuid = [prefs stringForKey:@"uuid"];

    if (bundleVersion == nil) {
      bundleVersion = [[NSBundle mainBundle] infoDictionary][@"CFBundleVersion"];
      if (bundleVersion == nil) {
        bundleVersion = @"";
      }
    }

    json[@"platform"] = @"ios";
    json[@"platformVersion"] = platformVersion;
    json[@"version"] = version;
    json[@"bundleName"] = bundleName;
    json[@"bundleVersion"] = bundleVersion;
    json[@"device"] = uuid;

    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:json] callbackId:command.callbackId];

}

- (void) getPreferences:(CDVInvokedUrlCommand*)command {
    // Get updated preferences if available
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSDictionary *savedPrefs = [prefs objectForKey:@"ionicDeploySavedPreferences"];

    if (savedPrefs!= nil) {
        NSLog(@"Found saved prefs: %@", savedPrefs);
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: savedPrefs] callbackId:command.callbackId];
        return;
    }

    // Get preferences from cordova
    NSString *appId = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonAppId"]];
    NSString *debug = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonDebug"]];
    NSString *host = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonApi"]];
    NSString *updateMethod = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonUpdateMethod"]];
    NSString *channel = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonChannelName"]];
    NSNumber *maxV = [NSNumber numberWithInt:[[[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonMaxVersions"] intValue]];
    NSNumber *minBackgroundDuration = [NSNumber numberWithInt:[[[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonMinBackgroundDuration"] intValue]];

    // Build the preferences json object
    NSMutableDictionary *json = [[NSMutableDictionary alloc] init];
    json[@"appId"] = appId;
    json[@"debug"] = debug;
    json[@"channel"] = channel;
    json[@"host"] = host;
    json[@"updateMethod"] = updateMethod;
    json[@"maxVersions"] = maxV;
    json[@"minBackgroundDuration"] = minBackgroundDuration;
    json[@"updates"] = [[NSDictionary alloc] init];
    NSLog(@"Got app preferences: %@", json);

    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:json] callbackId:command.callbackId];
}

- (void) setPreferences:(CDVInvokedUrlCommand*)command {
    NSDictionary *json = command.arguments[0];
    NSLog(@"Got prefs to save: %@", json);
    [[NSUserDefaults standardUserDefaults] setObject:json forKey:@"ionicDeploySavedPreferences"];
    [[NSUserDefaults standardUserDefaults] synchronize];

    [self getPreferences:command];
}

@end
