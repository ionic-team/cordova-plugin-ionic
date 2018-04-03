#import "IonicCordovaCommon.h"
#import <Cordova/CDVPluginResult.h>

@implementation IonicCordovaCommon

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

    NSLog(@"Called getPreferences");
    NSMutableDictionary *json = [[NSMutableDictionary alloc] init];
    [json setObject:@"myapp" forKey:@"appId"];
    [json setObject:@"false" forKey:@"debug"];
    [json setObject:@"mychannel" forKey:@"channel"];
    [json setObject:@"http://localhost:7000" forKey:@"host"];
    [json setObject:@"auto" forKey:@"updateMethod"];
    [json setObject:@5 forKey:@"maxVersions"];
    [json setObject:@"version1" forKey:@"versionId"];

    NSLog(@"Json: %@", json);

    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:json] callbackId:command.callbackId];
}

@end
