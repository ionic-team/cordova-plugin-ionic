#!/bin/bash
set -o errexit
rm -rf docs
npx typedoc --theme markdown --excludePrivate --excludeExternals --mdEngine github --name "Ionic Deploy" --readme README.md --hideGenerator --out docs/ --includeDeclarations --mdHideSources --mode file www/common.ts www/definitions.ts
