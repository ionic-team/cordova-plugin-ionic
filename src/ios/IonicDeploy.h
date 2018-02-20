#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>
#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>
#import "DownloadManager.h"
#import "SSZipArchive.h"

@interface IonicDeploy : CDVPlugin <DownloadManagerDelegate, SSZipArchiveDelegate, UIAlertViewDelegate>

@property (strong, nonatomic) DownloadManager *downloadManager;

+ (BOOL) isPluginUpdating;

- (NSString *) getUUID;

- (NSString *) constructVersionLabel: (NSString *) uuid;

- (NSArray *) deconstructVersionLabel: (NSString *) label;

- (struct JsonHttpResponse) postDeviceDetails;

- (void) showDebugDialog;

- (void) updateVersionLabel:(NSString *)uuid;

- (void) initVersionChecks;

- (void) initialize:(CDVInvokedUrlCommand *)command;

- (void) check:(CDVInvokedUrlCommand *)command;

- (void) parseUpdate:(CDVInvokedUrlCommand *)command;

- (void) _download;

- (void) download:(CDVInvokedUrlCommand *)command;

- (void) _extract;

- (void) extract:(CDVInvokedUrlCommand *)command;

- (void) redirect:(CDVInvokedUrlCommand *)command;

- (void) info:(CDVInvokedUrlCommand *)command;

- (void) doRedirect;

- (NSMutableArray *) getMyVersions;

- (NSMutableArray *) getDeployVersions;

- (void) getVersions:(CDVInvokedUrlCommand *)command;

- (bool) hasVersion:(NSString *) uuid;

- (void) saveVersion:(NSString *) uuid;

- (void) deleteVersion:(CDVInvokedUrlCommand *)command;

- (void) cleanupVersions;

- (BOOL) removeVersion:(NSString *) uuid;

- (BOOL) excludeVersionFromBackup:(NSString *) uuid;

@end

