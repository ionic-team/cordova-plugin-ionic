#import "IonicCordovaCommon.h"
#import <Cordova/CDVPluginResult.h>
#import <objc/message.h>


@interface IonicCordovaCommon()

@property Boolean revertToBase;
@property NSString *baseIndexPath;

@end

@implementation IonicCordovaCommon

- (void) pluginInitialize {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];

    self.revertToBase = true;
    self.baseIndexPath = [[NSBundle mainBundle] pathForResource:@"www" ofType: nil];

    if ([prefs stringForKey:@"uuid"] == nil) {
        [prefs setObject:[[NSUUID UUID] UUIDString] forKey:@"uuid"];
    }
    [prefs synchronize];
}

- (void) remove:(CDVInvokedUrlCommand*)command {
    NSDictionary *options = command.arguments[0];
    NSString *path = options[@"target"];
    NSLog(@"Got remove path: %@", path);
    NSError *removeError = nil;
    if (![[NSFileManager defaultManager] removeItemAtPath:path error:&removeError]) {
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString: [removeError localizedDescription]]  callbackId:command.callbackId];
        return;
    }
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId:command.callbackId];
}

- (void) copyTo:(CDVInvokedUrlCommand*)command {
    NSDictionary *options = command.arguments[0];
    NSLog(@"Got copyTo: %@", options);
    NSString *srcDir = options[@"source"][@"directory"];
    NSString *srcPath = options[@"source"][@"path"];
    NSString *dest = options[@"target"];
    
    if (![srcDir isEqualToString:@"APPLICATION"]) {
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString: @"Only Application directory is supported"]  callbackId:command.callbackId];
        return;
    }
    NSMutableString *source = [NSMutableString stringWithString:[[NSBundle mainBundle] resourcePath]];
    [source appendString:@"/"];
    [source appendString:srcPath];
    NSError *createDirError = nil;
    if (![[NSFileManager defaultManager] createDirectoryAtPath:dest withIntermediateDirectories:YES attributes:nil error:&createDirError]) {
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString: [createDirError localizedDescription]]  callbackId:command.callbackId];
        return;
    }
    [[NSFileManager defaultManager] removeItemAtPath:dest error:nil];
    NSError *copyError = nil;
    if (![[NSFileManager defaultManager] copyItemAtPath:source toPath:dest error:&copyError]) {
        NSLog(@"Error copying files: %@", [copyError localizedDescription]);
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString: [copyError localizedDescription]]  callbackId:command.callbackId];
        return;
    }
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId:command.callbackId];
}

- (void) downloadFile:(CDVInvokedUrlCommand*)command {
    NSDictionary *options = command.arguments[0];
    NSString *target = options[@"target"];
    NSString *urlStr = options[@"url"];
    NSLog(@"Got downloadFile: %@", options);
    
    NSURLRequest *request = [NSURLRequest requestWithURL:[NSURL URLWithString:urlStr]];
    NSURLSession *urlSession = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
    [[urlSession dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        if (error) {
            NSLog(@"Download Error:%@",error.description);
            [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString: [error localizedDescription]]  callbackId:command.callbackId];
        }
        if (data) {
            [data writeToFile:target atomically:YES];
            NSLog(@"File is saved to %@", target);
            [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId:command.callbackId];
        }
    }] resume];
}

- (void) getAppInfo:(CDVInvokedUrlCommand*)command {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSMutableDictionary *json = [[NSMutableDictionary alloc] init];
    NSString* platformVersion = [[UIDevice currentDevice] systemVersion];
    NSString* versionCode = [[NSBundle mainBundle] infoDictionary][@"CFBundleVersion"];
    NSString* bundleName = [[NSBundle mainBundle] infoDictionary][@"CFBundleIdentifier"];
    NSString* versionName = [[NSBundle mainBundle] infoDictionary][@"CFBundleShortVersionString"];
    NSString* uuid = [prefs stringForKey:@"uuid"];
    NSString *libPath = [NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES) objectAtIndex:0];
    NSString * cordovaDataDirectory = [libPath stringByAppendingPathComponent:@"NoCloud"];

    if (versionName == nil) {
      versionName = [[NSBundle mainBundle] infoDictionary][@"CFBundleVersion"];
      if (versionName == nil) {
        versionName = @"";
      }
    }

    json[@"platform"] = @"ios";
    json[@"platformVersion"] = platformVersion;
    json[@"version"] = versionCode;
    json[@"binaryVersionCode"] = versionCode;
    json[@"bundleName"] = bundleName;
    json[@"bundleVersion"] = versionName;
    json[@"binaryVersionName"] = versionName;
    json[@"device"] = uuid;
    json[@"dataDirectory"] = [[NSURL fileURLWithPath:cordovaDataDirectory] absoluteString];
    NSLog(@"Got app info: %@", json);

    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:json] callbackId:command.callbackId];

}

- (void) getPreferences:(CDVInvokedUrlCommand*)command {
    // Get updated preferences if available
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSDictionary *immutableStoredPrefs = [prefs objectForKey:@"ionicDeploySavedPreferences"];
    NSMutableDictionary *savedPrefs = [immutableStoredPrefs mutableCopy];
    NSMutableDictionary *nativeConfig = [self getNativeConfig];
    NSMutableDictionary *customConfig = [self getCustomConfig];

    if (savedPrefs!= nil) {
        
        NSLog(@"found some saved prefs doing precedence ops: %@", savedPrefs);
        // Merge with most up to date Native Settings
        [savedPrefs addEntriesFromDictionary:nativeConfig];

        // Merge with any custom settings
        [savedPrefs addEntriesFromDictionary:customConfig];

        NSLog(@"Returning saved prefs: %@", savedPrefs);
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: savedPrefs] callbackId:command.callbackId];
        return;
    }

    // No saved prefs found get them all from config
    // Make sure to initialize empty updates object
    NSLog(@"initing updates key");
    nativeConfig[@"updates"] = [[NSDictionary alloc] init];
    NSLog(@"Initialized App Prefs: %@", nativeConfig);

    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:nativeConfig] callbackId:command.callbackId];
}

- (void) setPreferences:(CDVInvokedUrlCommand*)command {
    NSDictionary *json = command.arguments[0];
    NSLog(@"Got prefs to save: %@", json);
    [[NSUserDefaults standardUserDefaults] setObject:json forKey:@"ionicDeploySavedPreferences"];
    [[NSUserDefaults standardUserDefaults] synchronize];

    [self getPreferences:command];
}

- (NSMutableDictionary*) getNativeConfig {
    // Get preferences from cordova
    NSString *appId = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonAppId"]];
    NSNumber * disabled = [NSNumber numberWithBool:[[self.commandDelegate.settings objectForKey:[@"DisableDeploy" lowercaseString]] boolValue]];
    NSString *host = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonApi"]];
    NSString *updateMethod = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonUpdateMethod"]];
    NSString *channel = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonChannelName"]];
    NSNumber *maxV = [NSNumber numberWithInt:[[[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonMaxVersions"] intValue]];
    NSNumber *minBackgroundDuration = [NSNumber numberWithInt:[[[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonMinBackgroundDuration"] intValue]];
    NSString* versionCode = [[NSBundle mainBundle] infoDictionary][@"CFBundleVersion"];
    NSString* versionName = [[NSBundle mainBundle] infoDictionary][@"CFBundleShortVersionString"];

    // Build the preferences json object
    NSMutableDictionary *json = [[NSMutableDictionary alloc] init];
    json[@"appId"] = appId;
    json[@"disabled"] = disabled;
    json[@"channel"] = channel;
    json[@"host"] = host;
    json[@"updateMethod"] = updateMethod;
    json[@"maxVersions"] = maxV;
    json[@"minBackgroundDuration"] = minBackgroundDuration;
    json[@"binaryVersionCode"] = versionCode;
    json[@"binaryVersion"] = versionName;
    json[@"binaryVersionName"] = versionName;
    NSLog(@"Got Native app preferences: %@", json);
    return json;
}

- (NSMutableDictionary*) getCustomConfig {
    // Get custom preferences if available
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSDictionary *immutableConfig = [prefs objectForKey:@"ionicDeployCustomPreferences"];
    NSMutableDictionary *customConfig = [immutableConfig mutableCopy];
    if (customConfig!= nil) {
        NSLog(@"Found custom config: %@", customConfig);
        return customConfig;
    }
    NSLog(@"No custom config found");
    NSMutableDictionary *json = [[NSMutableDictionary alloc] init];
    return json;
}

- (void) configure:(CDVInvokedUrlCommand *)command {
    NSDictionary *newConfig = command.arguments[0];
    NSLog(@"Got new config to save: %@", newConfig);
    NSMutableDictionary *storedConfig = [self getCustomConfig];
    [storedConfig addEntriesFromDictionary:newConfig];
    [[NSUserDefaults standardUserDefaults] setObject:storedConfig forKey:@"ionicDeployCustomPreferences"];
    [[NSUserDefaults standardUserDefaults] synchronize];

    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:newConfig] callbackId:command.callbackId];
}

@end
