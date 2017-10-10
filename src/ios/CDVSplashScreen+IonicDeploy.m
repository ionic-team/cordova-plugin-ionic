#import "CDVSplashScreen+IonicDeploy.h"
#import <objc/runtime.h>
#import <Cordova/CDVViewController.h>
#import <Cordova/CDVScreenOrientationDelegate.h>

@implementation CDVSplashScreen(Deploy)

- (void)swizzled_hideViews
{
    if ([IonicDeploy isPluginUpdating]) {
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (uint64_t) 1 * NSEC_PER_SEC), dispatch_get_main_queue(), CFBridgingRelease(CFBridgingRetain(^(void) {
            [self hideViews];
        })));
    } else {
        [self swizzled_hideViews];
    }
}

- (void)swizzled_destroyViews
{
    if ([IonicDeploy isPluginUpdating]) {
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (uint64_t) 1 * NSEC_PER_SEC), dispatch_get_main_queue(), CFBridgingRelease(CFBridgingRetain(^(void) {
            [self destroyViews];
        })));
    } else {
        [self swizzled_destroyViews];
    }
}

+ (void)swizzle:(SEL)originalSelector newImp:(SEL)swizzledSelector
{
    Class class = [self class];
    Method originalMethod = class_getInstanceMethod(class, originalSelector);
    Method swizzledMethod = class_getInstanceMethod(class, swizzledSelector);
    BOOL didAddMethod = class_addMethod(class,
                                        originalSelector,
                                        method_getImplementation(swizzledMethod),
                                        method_getTypeEncoding(swizzledMethod));
    
    if (didAddMethod) {
        class_replaceMethod(class,
                            swizzledSelector,
                            method_getImplementation(originalMethod),
                            method_getTypeEncoding(originalMethod));
    } else {
        method_exchangeImplementations(originalMethod, swizzledMethod);
    }
}

+ (void)load
{
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        Class class = [self class];
        
        SEL originalHide = @selector(hideViews);
        SEL swizzledHide = @selector(swizzled_hideViews);
        [class swizzle:originalHide newImp:swizzledHide];
        
        SEL originalDestroy = @selector(destroyViews);
        SEL swizzledDestroy = @selector(swizzled_destroyViews);
        [class swizzle:originalDestroy newImp:swizzledDestroy];
    });
}
@end
