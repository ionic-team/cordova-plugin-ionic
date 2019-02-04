#!/bin/bash
set -o errexit
rm -rf docs
npx typedoc --theme markdown --mdEngine github --name "Cordova Plugin Ionic" --readme none --hideGenerator --out docs/ --includeDeclarations --excludeExternals --mdHideSources --mode file types/IonicCordova.d.ts
rm -rf docs/README.md
rm -rf docs/modules
ls -d -1 docs/interfaces/* | xargs sed -i '' 's/README\.md.*\.md/..\/README.md/g'
