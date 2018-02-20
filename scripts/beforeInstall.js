var fs = require('fs');
var path = require('path');

IOS_PLATFORM = '<platform name="ios">'
ZIP_PLUGINS = ['cordova-plugin-zip'];
ZIP_SOURCES = '\n\t<header-file src="src/ios/SSZipArchive.h" />\n\t<source-file src="src/ios/SSZipArchive.m" />\n\t<header-file src="src/ios/MiniZip/crypt.h" />\n\t<header-file src="src/ios/MiniZip/ioapi.h" />\n\t<source-file src="src/ios/MiniZip/ioapi.c" />\n\t<header-file src="src/ios/MiniZip/unzip.h" />\n\t<source-file src="src/ios/MiniZip/unzip.c" />\n\t<header-file src="src/ios/MiniZip/zip.h" />\n\t<source-file src="src/ios/MiniZip/zip.c" />\n'

module.exports = function(context) {
  var cordovaUtil = context.requireCordovaModule("../cordova/util");
  var rootDir = cordovaUtil.isCordova();
  var includeZip = true;
  if (context && context.cordova && context.opts && context.opts.cordova) {
    context.opts.cordova.plugins.forEach(function(plugin) {
      ZIP_PLUGINS.forEach(function(zipper) {
        if (plugin === zipper) {
          includeZip = false;
        }
      });
    });
  }

  if (includeZip) {
    console.log("Injecting zip library");
    var contents = fs.readFileSync(path.join(context.opts.plugin.dir, 'plugin.xml'), 'utf-8');
    if(contents) {
      contents = contents.substring(contents.indexOf('<'));
    }
    fs.writeFileSync(path.join(context.opts.plugin.dir, 'plugin.xml'), contents.replace(IOS_PLATFORM, IOS_PLATFORM + ZIP_SOURCES));
  }
}