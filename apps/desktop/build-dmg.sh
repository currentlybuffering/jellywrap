#!/bin/bash
set -e

APP_NAME="JellyWrap"
APP_PATH="src-tauri/target/release/bundle/macos/JellyWrap.app"
DMG_NAME="JellyWrap_0.1.0_aarch64"
STAGING="/tmp/jellywrap-dmg-staging"

rm -rf "$STAGING" 2>/dev/null || true
mkdir -p "$STAGING"
cp -R "$APP_PATH" "$STAGING/"
ln -sf /Applications "$STAGING/Applications"

hdiutil create \
  -volname "$APP_NAME" \
  -srcfolder "$STAGING" \
  -ov \
  -format UDZO \
  "src-tauri/target/release/bundle/dmg/${DMG_NAME}.dmg"

rm -rf "$STAGING"
echo "DMG created: src-tauri/target/release/bundle/dmg/${DMG_NAME}.dmg"
