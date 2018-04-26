#import "IonicCordovaCommon.h"
#import <Cordova/CDVPluginResult.h>

@implementation IonicCordovaCommon

NSString *const NO_DEPLOY_LABEL = @"none";

- (void) getAppInfo:(CDVInvokedUrlCommand*)command
{
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

- (void) getPreferences:(CDVInvokedUrlCommand*)command
{
    // Get preferences
    NSString *appId = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonAppId"]];
    NSString *debug = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonDebug"]];
    NSString *host = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonApi"]];
    NSString *updateMethod = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonUpdateMethod"]];
    NSString *channel = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonChannelName"]];
    NSString *maxV = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] valueForKey:@"IonMaxVersions"]];

    // Build the preferences json object
    NSMutableDictionary *json = [[NSMutableDictionary alloc] init];
    [json setObject:appId forKey:@"appId"];
    [json setObject:debug forKey:@"debug"];
    [json setObject:channel forKey:@"channel"];
    [json setObject:host forKey:@"host"];
    [json setObject:updateMethod forKey:@"updateMethod"];
    [json setObject:maxV forKey:@"maxVersions"];
    [json setObject:NO_DEPLOY_LABEL forKey:@"currentVersionId"];
    NSLog(@"Got app preferences: %@", json);

    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:json] callbackId:command.callbackId];
}

@end
