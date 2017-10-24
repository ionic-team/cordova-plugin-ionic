#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>
#import "CDVSplashScreen.h"
#import "IonicDeploy.h"

@interface CDVSplashScreen (Deploy)

- (void)hideViews;

- (void)destroyViews;

@end