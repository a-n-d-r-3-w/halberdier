#!/bin/bash
rm -rf temp
echo ===== Unzipping Electron distribution =====
unzip electron-v1.8.2-darwin-x64.zip -d temp || echo Electron distribution not found. Download the latest darwin ZIP \
file from https://github.com/electron/electron/releases, save it in this folder, and update this script with the \
downloaded ZIP file name.

echo ===== Copying app into distribution =====
mkdir temp/Electron.app/Contents/Resources/app
cp package.json temp/Electron.app/Contents/Resources/app/
cp index.html temp/Electron.app/Contents/Resources/app/
cp main.js temp/Electron.app/Contents/Resources/app/
cp -av dist temp/Electron.app/Contents/Resources/app/

mkdir temp/Electron.app/Contents/Resources/app/src
cp src/halberd.png temp/Electron.app/Contents/Resources/app/src/

echo ===== Copying icons into app =====
cp icons/halberdier.icns temp/Electron.app/Contents/Resources/

echo ===== Setting brand =====
sed -e 's/Electron/Halberdier/g' -i .orig1 temp/Electron.app/Contents/Info.plist
sed -e 's/electron/halberdier/g' -i .orig2 temp/Electron.app/Contents/Info.plist

sed -e 's/Electron/Halberdier/g' -i .orig1 temp/Electron.app/Contents/Frameworks/Electron\ Helper.app/Contents/Info.plist
sed -e 's/electron/halberdier/g' -i .orig2 temp/Electron.app/Contents/Frameworks/Electron\ Helper.app/Contents/Info.plist

echo ===== Renaming .app file =====
mv temp/Electron.app temp/Halberdier.app

echo ===== REMAINING STEPS FOR YOU =====
echo 1. In temp/Halberdier.app/Contents/Info.plist, reset CFBundleExecutable back to \"Electron\".
echo 2. ZIP Halberdier.app.