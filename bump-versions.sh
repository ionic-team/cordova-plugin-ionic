# Releases a new version to npm
set -f errexit

# Script vars
VERSION=$(npm list @ionic/pro-jobs | grep "@" | cut -d "@" -f 3 | cut -d " " -f 1)
# Update common.ts
sed -E -i "" "s/PLUGIN_VERSION = [\"'][0-9]+.[0-9]+.[0-9]+/PLUGIN_VERSION = \"$VERSION/g" www/common.ts
git add www/common.ts

# Update plugin.xml
npm run sync-plugin-xml

echo "Remember to update the changelog..."
