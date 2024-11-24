#!/bin/bash

# Define variables for paths and tokens
GAME_DIR="D:/Cocos/Project/spadesClient"
BUILD_DIR="$GAME_DIR/build/web-desktop"
ZIP_FILE="$BUILD_DIR.zip"
APP_ID="741740011369808"
ACCESS_TOKEN="GG|474608668887167|YPpHW7k47pcBZ9-zZJYwMQlS0hY"
UPLOAD_URL="https://graph-video.facebook.com/474608668887167/assets"
COCOS_CREATOR_PATH="C:/ProgramData/cocos/editors/Creator/2.4.9/CocosCreator.exe"

# Step 1: Build the game
echo "Building the game..."
"$COCOS_CREATOR_PATH" --path "$GAME_DIR" --build "web-desktop"

# Step 2: Zip the folder
echo "Zipping the game folder..."
if [ -f "$ZIP_FILE" ]; then
  rm "$ZIP_FILE" # Remove existing zip file if it exists
fi
zip -r "$ZIP_FILE" "$BUILD_DIR"

# Step 3: Upload the zip file to Facebook Graph API
echo "Uploading the game to Facebook..."
curl -X POST "$UPLOAD_URL" \
  -F "access_token=$ACCESS_TOKEN" \
  -F "type=BUNDLE" \
  -F "asset=@$ZIP_FILE" \
  -F "comment=Done 1.0"

echo "Upload complete."
