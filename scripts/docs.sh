#!/bin/bash
set -o errexit
rm -rf docs
npx typedoc --theme markdown --mdEngine github --name "Cordova Plugin Ionic" --readme none --hideGenerator --out docs/ types/IonicCordova.d.ts --includeDeclarations --excludeExternals
rm -rf docs/README.md
rm -rf docs/modules
ls -d -1 docs/interfaces/* | xargs sed -i '' 's/README\.md.*\.md/..\/README.md/g'
