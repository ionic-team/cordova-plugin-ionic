# Releases a new version to npm
set -f errexit

# Script vars
RELEASE_TYPE=${RELEASE_TYPE:-patch}
RAW_VERSION=$(npm version $RELEASE_TYPE)
VERSION=$(echo $RAW_VERSION | cut -c 2-)

# Update common.ts
sed -E -i "" "s/PLUGIN_VERSION = [\"'][0-9]+.[0-9]+.[0-9]+/PLUGIN_VERSION = \"$VERSION/g" www/common.ts

# Update plugin.xml
npm run sync-plugin-xml

echo "Remember to update the changelog..."