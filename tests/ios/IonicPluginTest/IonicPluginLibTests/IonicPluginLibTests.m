//
//  IonicPluginLibTests.m
//  IonicPluginLibTests
//

#import <XCTest/XCTest.h>
#include <UIKit/UIKit.h>
#import "IonicDeploy.h"

@interface IonicPluginLibTests : XCTestCase

@property (nonatomic, strong) IonicDeploy* plugin;

@end

@implementation IonicPluginLibTests

- (void)setUp {
    [super setUp];
    self.plugin = [[IonicDeploy alloc] init];
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    [super tearDown];
}

- (void)testExample {
    // This is an example of a functional test case.
    // Use XCTAssert and related functions to verify your tests produce the correct results.
    
}

- (void)testPerformanceExample {
    // This is an example of a performance test case.
    [self measureBlock:^{
        // Put the code you want to measure the time of here.
    }];
}

@end
