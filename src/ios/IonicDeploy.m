#import "IonicDeploy.h"
#import <Cordova/CDV.h>
#import "UNIRest.h"
#import "SSZipArchive.h"
#import "IonicConstant.h"
#import <objc/message.h>
#import <UIKit/UIKit.h>
#import <WebKit/WebKit.h>

typedef struct JsonHttpResponse {
    __unsafe_unretained NSString *message;
    __unsafe_unretained NSDictionary *json;
    Boolean *error;
} JsonHttpResponse;

@interface IonicDeploy()

@property (nonatomic) NSURLConnection *connectionManager;
@property (nonatomic) NSMutableData *downloadedMutableData;
@property (nonatomic) NSURLResponse *urlResponse;

@property int progress;
@property NSString *callbackId;
@property NSString *appId;
@property NSString *channel_tag;
@property NSString *auto_update;
@property int maxVersions;
@property NSDictionary *last_update;
@property Boolean ignore_deploy;
@property NSString *shouldDebug;
@property NSString *version_label;
@property NSString *currentUUID;
@property dispatch_queue_t serialQueue;
@property NSString *cordova_js_resource;
@property NSString *index_html_resource;
@property NSString *deploy_server;

// private
- (Boolean) parseCheckResponse:(JsonHttpResponse)result;
- (void) handleCheckResponse:(JsonHttpResponse)result callbackId:(NSString *)callbackId;

@end

static NSOperationQueue *delegateQueue;

@implementation IonicDeploy

+ (BOOL) isPluginUpdating {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    return [prefs boolForKey:@"show_splash"];
}


- (BOOL) isDebug {
#ifdef DEBUG
    if([self.shouldDebug isEqualToString:@"false"]) {
        return NO;
    } else {
        return YES;
    }
#else
    return NO;
#endif
}

- (void)showDebugDialog {
#ifdef __IPHONE_8_0
    if (NSClassFromString(@"UIAlertController")) {

        UIAlertController *alertController = [UIAlertController
                                              alertControllerWithTitle:@"Deploy: Debug"
                                              message:@"A newer version of this app is available on this device.\nSince this is a debug build, would you like to update or stay on the bundled version?\n(This warning only appears in debug builds)"
                                              preferredStyle:UIAlertControllerStyleAlert];

        if ([[[UIDevice currentDevice] systemVersion] floatValue] < 8.3) {
            CGRect alertFrame = [UIScreen mainScreen].applicationFrame;
            if (UIInterfaceOrientationIsLandscape([[UIApplication sharedApplication] statusBarOrientation])) {
                // swap the values for the app frame since it is now in landscape
                CGFloat temp = alertFrame.size.width;
                alertFrame.size.width = alertFrame.size.height;
                alertFrame.size.height = temp;
            }
            alertController.view.frame =  alertFrame;
        }

        __weak IonicDeploy* weakDeploy = self;

        [alertController addAction:[UIAlertAction
                                    actionWithTitle:@"Update"
                                    style:UIAlertActionStyleDefault
                                    handler:^(UIAlertAction * action) {
                                        [weakDeploy doRedirect];
                                    }]];
        [alertController addAction:[UIAlertAction
                                    actionWithTitle:@"Ignore"
                                    style:UIAlertActionStyleDefault
                                    handler:^(UIAlertAction * action) {
                                        NSLog(@"Skipping redirect");
                                    }]];

        UIViewController *presentingViewController = self.viewController;
        while(presentingViewController.presentedViewController != nil && ![presentingViewController.presentedViewController isBeingDismissed]) {
            presentingViewController = presentingViewController.presentedViewController;
        }

        [presentingViewController presentViewController:alertController animated:YES completion:nil];
    }
#endif
}

- (void) pluginInitialize {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    self.cordova_js_resource = [[NSBundle mainBundle] pathForResource:@"www/cordova" ofType:@"js"];
    self.serialQueue = dispatch_queue_create("Deploy Plugin Queue", NULL);

    // Load version label
    self.version_label = [prefs stringForKey:@"ionicdeploy_version_label"];
    if (!self.version_label) {
        self.version_label = NO_DEPLOY_LABEL;
    }

    // Load App ID
    self.appId = [prefs stringForKey:@"ion_app_id"];
    if (!self.appId) {
        self.appId = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonAppId"]];
    }

    // Load Debug
    self.shouldDebug = [prefs stringForKey:@"ion_debug"];
    if (!self.shouldDebug) {
        self.shouldDebug = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonDebug"]];
    }

    // Load Pro API
    self.deploy_server = [prefs stringForKey:@"ion_api"];
    if (!self.deploy_server) {
        self.deploy_server = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonApi"]];
    }

    // Load update method
    self.auto_update = [prefs stringForKey:@"ion_update_method"];
    if (!self.auto_update) {
        self.auto_update = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonUpdateMethod"]];
    }

    // Load target channel
    self.channel_tag = [prefs stringForKey:@"channel"];
    if (!self.channel_tag) {
        self.channel_tag = [NSString stringWithFormat:@"%@", [[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonChannelName"]];
    }

    self.maxVersions = [[[NSBundle mainBundle] objectForInfoDictionaryKey:@"IonMaxVersions"] intValue];

    [self initVersionChecks];

    if (![self.auto_update isEqualToString:@"none"] && [self parseCheckResponse:[self postDeviceDetails]]) {
        // We want to check for updates on startup
        if ([self.auto_update isEqualToString:@"auto"]) {
            [prefs setBool:YES forKey:@"show_splash"];
            [prefs synchronize];
        } else {
            [prefs setBool:NO forKey:@"show_splash"];
            [prefs synchronize];
        }
        [self _download];
    } else {
        [prefs setBool:NO forKey:@"show_splash"];
        [prefs synchronize];
    }

    NSString *uuid = [[NSUserDefaults standardUserDefaults] objectForKey:@"uuid"];
    NSString *ignore = [prefs stringForKey:@"ionicdeploy_version_ignore"];
    if (ignore == nil) {
        ignore = NOTHING_TO_IGNORE;
    }

    if (![uuid isEqualToString:@""] && !self.ignore_deploy && ![uuid isEqualToString:ignore]) {
        if ( uuid != nil && ![self.currentUUID isEqualToString: uuid] ) {
            // Get target index.html
            NSArray *paths = NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES);
            NSString *libraryDirectory = [paths objectAtIndex:0];
            NSString *path = [NSString stringWithFormat:@"%@/%@/index.html", libraryDirectory, uuid];

            SEL wkWebViewSelector = NSSelectorFromString(@"loadFileURL:allowingReadAccessToURL:");
            if ([self.webView respondsToSelector:wkWebViewSelector]) {
                // It's a WKWebview
                [((WKWebView*)self.webView)
                 evaluateJavaScript:@"window.location.href"
                 completionHandler:^(NSString *result, NSError *error) {
                     NSArray *indexSplit = [result componentsSeparatedByString:@"?"];
                     NSString *currentIndex = [indexSplit objectAtIndex:0];
                     if (![currentIndex isEqualToString:path]) {
                         [self redirect];
                     }
                 }];

            } else {
                // It's a UIWebView
                NSString *currentIndex = [((UIWebView*)self.webView) stringByEvaluatingJavaScriptFromString:@"window.location.href"];
                NSArray *indexSplit = [currentIndex componentsSeparatedByString:@"?"];
                currentIndex = [indexSplit objectAtIndex:0];
                if (![currentIndex isEqualToString:path]) {
                    [self redirect];
                }
            }
        }
    }
}

- (NSString *) getUUID {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSString *uuid = [prefs stringForKey:@"uuid"];
    if(uuid == nil) {
        uuid = NO_DEPLOY_LABEL;
    }
    return uuid;
}

- (NSArray *) deconstructVersionLabel: (NSString *) label {
    return [label componentsSeparatedByString:@":"];
}

- (NSString *) constructVersionLabel: (NSString *) uuid {
    NSString *version = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"];
    NSFileManager* fm = [NSFileManager defaultManager];
    NSDictionary* attrs = [fm attributesOfItemAtPath:self.cordova_js_resource error:nil];

    if (attrs != nil) {
        NSDate *date = (NSDate*)[attrs objectForKey: NSFileCreationDate];
        int int_timestamp = [date timeIntervalSince1970];
        NSString *timestamp = [NSString stringWithFormat:@"%d", int_timestamp];
        return [NSString stringWithFormat:@"%@:%@:%@", version, timestamp, uuid];
    }
    return NO_DEPLOY_LABEL;
}

- (void) updateVersionLabel: (NSString *)ignore_version {
    NSLog(@"updating version label");
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSString *ionicdeploy_version_label = [self constructVersionLabel:[self getUUID]];
    [prefs setObject:ionicdeploy_version_label forKey: @"ionicdeploy_version_label"];
    [prefs setObject:ignore_version forKey: @"ionicdeploy_version_ignore"];
    [prefs synchronize];
    self.version_label = ionicdeploy_version_label;
}

- (void) initVersionChecks {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSString *uuid = [self getUUID];
    NSString *ionicdeploy_version_label = [self constructVersionLabel:uuid];

    NSLog(@"VERSION LABEL: %@", ionicdeploy_version_label);

    if(![ionicdeploy_version_label isEqualToString: NO_DEPLOY_LABEL]) {
        if(![self.version_label isEqualToString: ionicdeploy_version_label]) {
            self.ignore_deploy = true;
            [self updateVersionLabel:uuid];
            [prefs setObject: @"" forKey: @"uuid"];
            [prefs setBool:YES forKey:@"show_splash"];
            [prefs synchronize];
        }
    }
}

- (void) initialize:(CDVInvokedUrlCommand *)command {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSString *jsonString = [command.arguments objectAtIndex:0];
    NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
    NSError *jsonError = nil;
    NSDictionary *jsonRes = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&jsonError];

    if (jsonError != nil) {
        NSString *err = [NSString stringWithFormat:@"%@", [jsonError localizedDescription]];
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:err] callbackId:command.callbackId];
        return;
    }

    if ([jsonRes valueForKey:@"appId"] != nil) {
        self.appId = [jsonRes valueForKey:@"appId"];
        [prefs setObject:self.appId forKey:@"ion_app_id"];
    }

    if ([jsonRes valueForKey:@"debug"] != nil) {
        self.appId = [jsonRes valueForKey:@"debug"];
        [prefs setObject:self.appId forKey:@"ion_debug"];
    }

    if ([jsonRes valueForKey:@"host"] != nil) {
        self.deploy_server = [jsonRes valueForKey:@"host"];
        [prefs setObject:self.deploy_server forKey:@"ion_api"];
    }

    if ([jsonRes valueForKey:@"channel"] != nil) {
        self.channel_tag = [jsonRes valueForKey:@"channel"];
        [prefs setObject:self.channel_tag forKey:@"channel"];
    }

    [prefs synchronize];
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:nil] callbackId:command.callbackId];
}

- (void) check:(CDVInvokedUrlCommand *)command {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    [prefs setObject: self.channel_tag forKey: @"channel"];
    [prefs synchronize];

    if([self.appId isEqual: @"YOUR_APP_ID"]) {
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Please set your app id in app.js for YOUR_APP_ID before using $ionicDeploy"] callbackId:command.callbackId];
        return;
    }

    dispatch_async(self.serialQueue, ^{
        JsonHttpResponse result = [self postDeviceDetails];

        NSLog(@"Response: %@", result.message);

        [self handleCheckResponse:result callbackId:command.callbackId];
    });
}

- (void) parseUpdate:(CDVInvokedUrlCommand *)command {
    NSString *jsonString = [command.arguments objectAtIndex:0];
    NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];

    if([self.appId isEqual: @"YOUR_APP_ID"]) {
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Please set your app id in app.js for YOUR_APP_ID before using $ionicDeploy"] callbackId:command.callbackId];
        return;
    }

    dispatch_async(self.serialQueue, ^{
        JsonHttpResponse result;

        NSError *jsonError = nil;

        result.message = nil;
        result.json = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&jsonError];

        NSLog(@"JSON Error: %@", jsonError);

        if (jsonError != nil) {
            result.message = [NSString stringWithFormat:@"%@", [jsonError localizedDescription]];
            result.json = nil;
        }

        NSLog(@"Response: %@", result.message);

        [self handleCheckResponse:result callbackId:command.callbackId];
    });
}

// private
- (Boolean) parseCheckResponse: (JsonHttpResponse)result {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSString *our_version = [[NSUserDefaults standardUserDefaults] objectForKey:@"uuid"];

    if(result.json != nil) {
        NSLog(@"JSON: %@", result.json);
        NSDictionary *resp = [result.json objectForKey: @"data"];
        NSNumber *compatible = [resp valueForKey:@"compatible"];
        NSNumber *partial = [resp valueForKey:@"partial"] ?: [NSNumber numberWithBool:NO];
        NSNumber *update_available = [resp valueForKey:@"available"];
        NSString *ignore_version = [prefs objectForKey:@"ionicdeploy_version_ignore"];

        NSLog(@"compatible: %@", (compatible) ? @"True" : @"False");
        NSLog(@"available: %@", (update_available) ? @"True" : @"False");
        NSLog(@"partial: %@", (partial) ? @"True" : @"False");

        [prefs setObject: partial forKey: @"upstream_partial_update"];

        if (compatible != [NSNumber numberWithBool:YES]) {
            NSLog(@"Refusing update due to incompatible binary version");
        } else if(update_available == [NSNumber numberWithBool: YES]) {
            NSString *update_uuid = [resp objectForKey:@"snapshot"];
            NSLog(@"update uuid: %@", update_uuid);

            if(![update_uuid isEqual:ignore_version] && ![update_uuid isEqual:our_version]) {
                [prefs setObject: update_uuid forKey: @"upstream_uuid"];
                self.last_update = resp;
            } else {
                update_available = 0;
            }
        }

        [prefs synchronize];

        if (update_available == [NSNumber numberWithBool:YES] && compatible == [NSNumber numberWithBool:YES]) {
            NSLog(@"update is true");
            return true;
        } else {
            NSLog(@"update is false");
            return false;
        }
    } else {
        NSLog(@"unable to check for updates");
        return false;
    }
}

- (void) handleCheckResponse:(JsonHttpResponse)result callbackId:(NSString *)callbackId {
    CDVPluginResult* pluginResult = nil;

    if([self parseCheckResponse:result]) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"true"];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"false"];
    }

    [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
}

- (void) _download {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];

    NSString *upstream_uuid = [[NSUserDefaults standardUserDefaults] objectForKey:@"upstream_uuid"];

    NSLog(@"Upstream UUID: %@", upstream_uuid);

    if (upstream_uuid != nil && [self hasVersion:upstream_uuid]) {
        // Set the current version to the upstream version (we already have this version)
        [prefs setObject:upstream_uuid forKey:@"uuid"];
        [prefs synchronize];
        if (self.callbackId) {
            [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"true"] callbackId:self.callbackId];
        } else {
            [self _extract];
        }
    } else {
        NSDictionary *result = self.last_update;
        NSString *download_url = [result objectForKey:@"url"];

        NSLog(@"download url is: %@", download_url);

        self.downloadManager = [[DownloadManager alloc] initWithDelegate:self];

        NSURL *url = [NSURL URLWithString:download_url];

        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES);
        NSString *libraryDirectory = [paths objectAtIndex:0];
        NSString *filePath = [NSString stringWithFormat:@"%@/%@", libraryDirectory,@"www.zip"];

        NSLog(@"Queueing Download...");
        [self.downloadManager addDownloadWithFilename:filePath URL:url];
    }
}

- (void) _extract {
    self.ignore_deploy = false;
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSString *upstream_uuid = [prefs objectForKey:@"upstream_uuid"];
    NSString *uuid = [prefs objectForKey:@"uuid"];
    BOOL success = true;

    if(upstream_uuid != nil && [self hasVersion:upstream_uuid]) {
        [prefs setObject: upstream_uuid forKey: @"uuid"];
        [prefs synchronize];
        [self updateVersionLabel:NOTHING_TO_IGNORE];
    } else {
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES);
        NSString *libraryDirectory = [paths objectAtIndex:0];
        NSString *filePath = [NSString stringWithFormat:@"%@/%@", libraryDirectory, @"www.zip"];
        NSString *extractPath = [NSString stringWithFormat:@"%@/%@/", libraryDirectory, upstream_uuid];
        NSString *curPath = [[[NSBundle mainBundle] pathForResource:@"www/index" ofType:@"html"] stringByDeletingLastPathComponent];

        if (![uuid isEqualToString:@""]) {
            curPath = [NSString stringWithFormat:@"%@/%@/", libraryDirectory, uuid];
        }

        if ([prefs objectForKey:@"upstream_partial_update"] == [NSNumber numberWithBool:YES]) {
            NSLog(@"Partial update, copying existing version %@ from %@ to %@", uuid, curPath, extractPath);

            NSError *copyError = nil;
            [[NSFileManager defaultManager] copyItemAtPath:curPath toPath:extractPath error:&copyError];

            if (copyError != nil) {
                NSLog(@"%@", [copyError localizedFailureReason]);
                NSLog(@"%@", [copyError localizedDescription]);
                if (self.callbackId) {
                    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error copying old www"] callbackId:self.callbackId];
                }
                return;
            }
        }

        NSLog(@"Path for zip file: %@", filePath);
        NSLog(@"Unzipping...");

        NSError *unzipError = nil;
        [SSZipArchive unzipFileAtPath:filePath toDestination:extractPath overwrite:true password:nil error:&unzipError delegate:self];

        if (unzipError != nil) {
            NSLog(@"%@", [unzipError localizedFailureReason]);
            NSLog(@"%@", [unzipError localizedDescription]);
            if (self.callbackId) {
                [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error extracting deploy"] callbackId:self.callbackId];
            }
            return;
        }

        [prefs setObject: upstream_uuid forKey: @"uuid"];
        [prefs synchronize];

        [self saveVersion:upstream_uuid];
        [self excludeVersionFromBackup:uuid];
        [self updateVersionLabel:NOTHING_TO_IGNORE];
        success = [[NSFileManager defaultManager] removeItemAtPath:filePath error:nil];

        NSLog(@"Unzipped...");
        NSLog(@"Removing www.zip %d", success);
    }

    if (self.callbackId) {
        if (success) {
            [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"true"] callbackId:self.callbackId];
        } else {
            [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error extracting deploy"] callbackId:self.callbackId];
        }
    } else if ([self.auto_update isEqualToString:@"auto"]) {
        if ([self isDebug]) {
            [prefs setBool:NO forKey:@"show_splash"];
            [prefs synchronize];
            [self showDebugDialog];
        } else {
            [self redirect];
        }
    }
}

- (void) download:(CDVInvokedUrlCommand *)command {
    self.callbackId = command.callbackId;
    dispatch_async(self.serialQueue, ^{
        [self _download];
    });
}

- (void) extract:(CDVInvokedUrlCommand *)command {
    self.callbackId = command.callbackId;
    dispatch_async(self.serialQueue, ^{
        [self _extract];
    });
}

- (void) redirect:(CDVInvokedUrlCommand *)command {
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:nil];
    [self redirect];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) redirect {
    if ([self isDebug]) {
        [self showDebugDialog];
    } else {
        [self doRedirect];
    }
}

- (void) info:(CDVInvokedUrlCommand *)command {
    NSMutableDictionary *json = [[NSMutableDictionary alloc] init];
    NSString *uuid = [self getUUID];
    if ([uuid isEqualToString:@""]) {
        uuid = NO_DEPLOY_LABEL;
    }
    [json setObject:uuid forKey:@"deploy_uuid"];
    [json setObject:self.channel_tag forKey:@"channel"];
    [json setObject:[[self deconstructVersionLabel:self.version_label] firstObject] forKey:@"binary_version"];
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:json] callbackId:command.callbackId];
}

- (void) getVersions:(CDVInvokedUrlCommand *)command {
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:[self getDeployVersions]] callbackId:command.callbackId];
}

- (void) doRedirect {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSString *uuid = [[NSUserDefaults standardUserDefaults] objectForKey:@"uuid"];
    NSString *ignore = [prefs stringForKey:@"ionicdeploy_version_ignore"];
    if (ignore == nil) {
        ignore = NOTHING_TO_IGNORE;
    }

    NSLog(@"uuid is: %@", uuid);
    if (self.ignore_deploy) {
        NSLog(@"ignore deploy");
    }

    NSLog(@"ignore version: %@", ignore);
    if (![uuid isEqualToString:@""] && !self.ignore_deploy && ![uuid isEqualToString:ignore]) {
        dispatch_async(self.serialQueue, ^{
            if ( uuid != nil && ![self.currentUUID isEqualToString: uuid] ) {
                NSArray *paths = NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES);
                NSString *libraryDirectory = [paths objectAtIndex:0];
                NSString *query = [NSString stringWithFormat:@"cordova_js_bootstrap_resource=%@", self.cordova_js_resource];

                NSURLComponents *components = [NSURLComponents new];
                components.scheme = @"file";
                components.path = [NSString stringWithFormat:@"%@/%@/index.html", libraryDirectory, uuid];
                components.query = query;

                self.currentUUID = uuid;

                // Load the target index.html and init values
                NSString *htmlData = [NSString
                                      stringWithContentsOfFile:components.path
                                      encoding:NSUTF8StringEncoding
                                      error:nil];
                NSString *newReference = [NSString
                                          stringWithFormat:@"<script src=\"%@\"></script>", self.cordova_js_resource];
                NSError *error = nil;

                // Find an existing cordova.js tag
                NSRegularExpression *cordovaRegex = [NSRegularExpression
                                                     regularExpressionWithPattern:@"<script src=(?:\"|')(?:[\\w\\-\\:/\\.]*/)?cordova\\.js(?:[\\.\\w]*)?(?:\"|')>(.|[\\r\\n])*?</script>"
                                                     options:NSRegularExpressionCaseInsensitive
                                                     error:&error];
                NSArray *matches = [cordovaRegex matchesInString:htmlData options:0 range:NSMakeRange(0, [htmlData length])];
                if (matches && matches.count) {
                    // We found the script, update it
                    htmlData = [cordovaRegex
                                stringByReplacingMatchesInString:htmlData
                                options:0
                                range:NSMakeRange(0, [htmlData length])
                                withTemplate:newReference];
                }

                // Write new index.html
                [htmlData writeToFile:components.path atomically:YES encoding:NSUTF8StringEncoding error:nil];

                // Do redirect
                NSLog(@"Redirecting to: %@", components.URL.absoluteString);
                dispatch_async(dispatch_get_main_queue(), ^(void) {
                    NSLog(@"Reloading the web view.");
                    SEL reloadSelector = NSSelectorFromString(@"reload");
                    ((id (*)(id, SEL))objc_msgSend)(self.webView, reloadSelector);
                    [self.webViewEngine loadRequest:[NSURLRequest requestWithURL:components.URL]];

                    // Tell the swizzled splash it can hide after 3 seconds
                    // TODO: There HAS to be a more elegant way to accomplish this...
                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (uint64_t) 3 * NSEC_PER_SEC), dispatch_get_main_queue(), CFBridgingRelease(CFBridgingRetain(^(void) {
                        [prefs setBool:NO forKey:@"show_splash"];
                        [prefs synchronize];
                    })));
                });
            }
        });
    }
}

- (struct JsonHttpResponse) postDeviceDetails {
    NSString *baseUrl = self.deploy_server;
    NSString *endpoint = [NSString stringWithFormat:@"/apps/%@/channels/check-device/", self.appId];
    NSString *url = [NSString stringWithFormat:@"%@%@", baseUrl, endpoint];
    NSDictionary* headers = @{@"Content-Type": @"application/json", @"accept": @"application/json"};
    NSString *uuid = [[NSUserDefaults standardUserDefaults] objectForKey:@"uuid"];
    NSString *app_version = [[self deconstructVersionLabel:self.version_label] firstObject];

    NSMutableDictionary *deviceDict = [NSMutableDictionary
                                       dictionaryWithDictionary:@{
                                                                  @"platform" : @"ios",
                                                                  @"binary_version" : app_version
                                                                  }];

    if (uuid != nil && ![uuid  isEqual: @""]) {
        deviceDict[@"snapshot"] = uuid;
    }

    NSDictionary *parameters = @{
                                 @"device": deviceDict,
                                 @"app_id": self.appId,
                                 @"channel_name": self.channel_tag,
                                 @"plugin_version": PLUGIN_VERSION
                                 };
    UNIHTTPJsonResponse *result = [[UNIRest postEntity:^(UNIBodyRequest *request) {
        [request setUrl:url];
        [request setHeaders:headers];
        [request setBody:[NSJSONSerialization dataWithJSONObject:parameters options:0 error:nil]];
    }] asJson];

    NSLog(@"version is: %@", app_version);
    NSLog(@"uuid is: %@", uuid);
    NSLog(@"channel is: %@", self.channel_tag);

    JsonHttpResponse response;
    NSError *jsonError = nil;

    @try {
        response.message = nil;
        response.json = [result.body JSONObject];
    }
    @catch (NSException *exception) {
        response.message = exception.reason;
        NSLog(@"JSON Error: %@", jsonError);
        NSLog(@"Exception: %@", exception.reason);
    }
    @finally {
        NSLog(@"JSON Error: %@", jsonError);

        if (jsonError != nil) {
            response.message = [NSString stringWithFormat:@"%@", [jsonError localizedDescription]];
            response.json = nil;
        }
    }

    return response;
}

- (NSMutableArray *) getMyVersions {
    NSMutableArray *versions;
    NSArray *versionsLoaded = [[NSUserDefaults standardUserDefaults] arrayForKey:@"my_versions"];
    if (versionsLoaded != nil) {
        versions = [versionsLoaded mutableCopy];
    } else {
        versions = [[NSMutableArray alloc] initWithCapacity:5];
    }

    return versions;
}

- (NSMutableArray *) getDeployVersions {
    NSArray *versions = [self getMyVersions];
    NSMutableArray *deployVersions = [[NSMutableArray alloc] initWithCapacity:5];

    for (id version in versions) {
        NSArray *version_parts = [version componentsSeparatedByString:@"|"];
        NSString *version_uuid = version_parts[1];
        [deployVersions addObject:version_uuid];
    }

    return deployVersions;
}

- (void) removeVersionFromPreferences:(NSString *) uuid {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSArray *versions = [self getMyVersions];
    NSMutableArray *newVersions = [[NSMutableArray alloc] initWithCapacity:5];

    for (id version in versions) {
        NSArray *version_parts = [version componentsSeparatedByString:@"|"];
        NSString *version_uuid = version_parts[1];
        if (![version_uuid isEqualToString:uuid]) {
            [newVersions addObject:version];
        }
    }

    [prefs setObject:newVersions forKey:@"my_versions"];
    [prefs synchronize];
}


- (bool) hasVersion:(NSString *) uuid {
    NSArray *versions = [self getMyVersions];

    NSLog(@"Versions: %@", versions);

    for (id version in versions) {
        NSArray *version_parts = [version componentsSeparatedByString:@"|"];
        NSString *version_uuid = version_parts[1];

        NSLog(@"version_uuid: %@, uuid: %@", version_uuid, uuid);
        if ([version_uuid isEqualToString:uuid]) {
            return true;
        }
    }

    return false;
}

- (void) deleteVersion:(CDVInvokedUrlCommand *)command {
    NSString *uuid = [command.arguments objectAtIndex:0];
    BOOL success = [self removeVersion:uuid];
    CDVPluginResult *pluginResult = nil;

    if (success) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Unable to delete the deploy version"];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) saveVersion:(NSString *) uuid {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSMutableArray *versions = [self getMyVersions];

    int versionCount = (int) [[NSUserDefaults standardUserDefaults] integerForKey:@"version_count"];

    if (versionCount) {
        versionCount += 1;
    } else {
        versionCount = 1;
    }

    [prefs setInteger:versionCount forKey:@"version_count"];
    [prefs synchronize];

    NSString *versionString = [NSString stringWithFormat:@"%i|%@", versionCount, uuid];

    [versions addObject:versionString];

    [prefs setObject:versions forKey:@"my_versions"];
    [prefs synchronize];

    [self cleanupVersions];
}

- (void) cleanupVersions {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSMutableArray *versions = [self getMyVersions];

    int versionCount = (int) [[NSUserDefaults standardUserDefaults] integerForKey:@"version_count"];

    if (versionCount && versionCount > self.maxVersions) {
        NSInteger threshold = versionCount - self.maxVersions;

        NSInteger count = [versions count];
        for (NSInteger index = (count - 1); index >= 0; index--) {
            NSString *versionString = versions[index];
            NSArray *version_parts = [versionString componentsSeparatedByString:@"|"];
            NSInteger version_number = [version_parts[0] intValue];
            if (version_number < threshold) {
                [versions removeObjectAtIndex:index];
                [self removeVersion:version_parts[1]];
            }
        }

        NSLog(@"Version Count: %i", (int) [versions count]);
        [prefs setObject:versions forKey:@"my_versions"];
        [prefs synchronize];
    }
}

- (BOOL) excludeVersionFromBackup:(NSString *) uuid {
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES);
    NSString *libraryDirectory = [paths objectAtIndex:0];

    NSString *pathToFolder = [NSString stringWithFormat:@"%@/%@", libraryDirectory, uuid];
    NSURL *URL= [NSURL fileURLWithPath:pathToFolder];

    NSError *error = nil;
    BOOL success = [URL setResourceValue:[NSNumber numberWithBool: YES] forKey: NSURLIsExcludedFromBackupKey error: &error];
    if(!success) {
        NSLog(@"Error excluding %@ from backup %@", [URL lastPathComponent], error);
    } else {
        NSLog(@"Excluding %@ from backup", pathToFolder);
    }
    return success;
}

- (BOOL) removeVersion:(NSString *) uuid {
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];
    NSString *currentUUID = [self getUUID];
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES);
    NSString *libraryDirectory = [paths objectAtIndex:0];

    NSString *pathToFolder = [NSString stringWithFormat:@"%@/%@/", libraryDirectory, uuid];

    if ([uuid isEqualToString: currentUUID]) {
        [prefs setObject: @"" forKey: @"uuid"];
        [prefs synchronize];
    }

    BOOL success = [[NSFileManager defaultManager] removeItemAtPath:pathToFolder error:nil];

    if(success) {
        [self removeVersionFromPreferences:uuid];
    }

    NSLog(@"Removed Version %@ success? %d", uuid, success);
    return success;
}

/* Delegate Methods for the DownloadManager */

- (void)downloadManager:(DownloadManager *)downloadManager downloadDidReceiveData:(Download *)download;
{
    // download failed
    // filename is retrieved from `download.filename`
    // the bytes downloaded thus far is `download.progressContentLength`
    // if the server reported the size of the file, it is returned by `download.expectedContentLength`

    self.progress = ((100.0 / download.expectedContentLength) * download.progressContentLength);

    NSLog(@"Download Progress: %.0f%%", ((100.0 / download.expectedContentLength) * download.progressContentLength));

    if (self.callbackId) {
        CDVPluginResult* pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:self.progress];
        [pluginResult setKeepCallbackAsBool:TRUE];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
    }
}

- (void)didErrorLoadingAllForManager:(DownloadManager *)downloadManager{
    NSLog(@"Download Error");
    NSUserDefaults *prefs = [NSUserDefaults standardUserDefaults];

    if (self.callbackId) {
        CDVPluginResult* pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"download error"];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
    }

    [prefs setBool:NO forKey:@"show_splash"];
    [prefs synchronize];
}

- (void)didFinishLoadingAllForManager:(DownloadManager *)downloadManager
{
    NSLog(@"Download Finished...");

    if (self.callbackId) {
        CDVPluginResult* pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"true"];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
    } else {
        [self _extract];
    }
}

/* Delegate Methods for IonSSZipArchive */

- (void)zipArchiveProgressEvent:(NSInteger)loaded total:(NSInteger)total {
    float progress = ((100.0 / total) * loaded);
    NSLog(@"Zip Extraction: %.0f%%", progress);

    if (self.callbackId) {
        CDVPluginResult* pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:progress];
        [pluginResult setKeepCallbackAsBool:TRUE];

        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
    }
}

@end
