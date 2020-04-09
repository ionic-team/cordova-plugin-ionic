# Releases a new version to npm
set -f errexit

# Script vars
VERSION=$(npm list cordova-plugin-ionic | grep "@" | cut -d "@" -f 2 | cut -d " " -f 1);
echo "updating PLUGIN_VERSION in www/common.ts to $VERSION";
# Update common.ts
sed -E -i "" "s/^  public PLUGIN_VERSION = '[0-9a-zA-Z\.-]+';/  public PLUGIN_VERSION = '$VERSION';/g" www/common.ts
git add www/common.ts

echo "Remember to update the changelog..."
