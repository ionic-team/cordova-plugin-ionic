#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>
#import "CDVSplashScreen.h"
#import "IonicDeploy.h"

@interface CDVSplashScreen (Deploy)

- (void)pageDidLoad;

- (void)setVisible:(BOOL)visible andForce:(BOOL)force;

@end
