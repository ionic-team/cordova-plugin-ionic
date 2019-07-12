//
//  IonicCordovaCommon.h
//  IonicCordovaCommon
//
//  Created by Ionic on 4/26/2018.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.

#import <Cordova/CDVPlugin.h>

@interface IonicCordovaCommon : CDVPlugin

/**
 * Get basic app information.  Used for the Ionic monitoring service.
 *
 * @param command
 *
 * The callback id used when calling back into JavaScript.
 */
- (void) getAppInfo:(CDVInvokedUrlCommand*)command;

/**
 * Get cordova plugin preferences and state information.
 *
 * @param command
 *
 * The callback id used when calling back into JavaScript.
 */
- (void) getPreferences:(CDVInvokedUrlCommand *)command;

/**
* Set cordova plugin preferences and state information.
*
* @param command
*
* The callback id used when calling back into JavaScript.
*/
- (void) setPreferences:(CDVInvokedUrlCommand *)command;

/**
 * Set cordova custom plugin preferences and state information.
 *
 * @param command
 *
 * The callback id used when calling back into JavaScript.
 */
- (void) configure:(CDVInvokedUrlCommand *)command;

- (void) copyTo:(CDVInvokedUrlCommand *)command;

- (void) remove:(CDVInvokedUrlCommand *)command;

- (void) downloadFile:(CDVInvokedUrlCommand *)command;

/**
 * Get cordova plugin native congiguration and state information (config.xml stuff)
 *
 */
- (NSMutableDictionary*) getNativeConfig;

/**
 * Get cordova plugin custom congiguration overrides (things changed via configure method)
 *
 */
- (NSMutableDictionary*) getCustomConfig;

@end
