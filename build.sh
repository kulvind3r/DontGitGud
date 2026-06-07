#!/bin/bash

# --- CONFIGURATION ---
SRC_DIR="src"
BUILD_DIR="build"
RES_DIR="resources"
INDEX_FILE="index.html"

# List your assets here (space-separated)
TARGET_FILES=("script.js" "style.css" "favicon.png" "banner.png")

echo "[BUILD] Starting build process..."
echo "--------------------------------------------------"

# --- CLEAN & PREPARE BUILD DIRECTORIES ---
if [ -d "$BUILD_DIR" ]; then
    echo "[CLEAN] Wiping existing '$BUILD_DIR' directory..."
    rm -rf "$BUILD_DIR"
fi
echo "[DIR] Creating fresh '$BUILD_DIR' and subdirectories..."
mkdir -p "$BUILD_DIR/$RES_DIR"

# --- COPY INDEX.HTML TO BUILD ---
if [ -f "$SRC_DIR/$INDEX_FILE" ]; then
    echo "[COPY] Copying $INDEX_FILE to $BUILD_DIR..."
    cp "$SRC_DIR/$INDEX_FILE" "$BUILD_DIR/$INDEX_FILE"
else
    echo "[ERROR] $INDEX_FILE not found in $SRC_DIR!"
    exit 1
fi

echo "[BUILD] Processing fingerprinted assets..."

# --- PROCESS FINGERPRINTED ASSETS ---
for FILE in "${TARGET_FILES[@]}"; do
    SRC_PATH="$SRC_DIR/$RES_DIR/$FILE"
    
    if [ -f "$SRC_PATH" ]; then
        NAME="${FILE%.*}"
        EXT=".${FILE##*.}"
        
        # Generate short 8-character hash
        if command -v sha256sum &> /dev/null; then
            HASH=$(sha256sum "$SRC_PATH" | cut -c 1-8)
        elif command -v shasum &> /dev/null; then
            HASH=$(shasum -a 256 "$SRC_PATH" | cut -c 1-8)
        else
            HASH=$(md5sum "$SRC_PATH" | cut -c 1-8)
        fi
        
        NEW_FILE_NAME="${NAME}.${HASH}${EXT}"
        echo "[PROCESS] $RES_DIR/$FILE -> $RES_DIR/$NEW_FILE_NAME"
        cp "$SRC_PATH" "$BUILD_DIR/$RES_DIR/$NEW_FILE_NAME"
        
        # Update references via sed regex parsing
        sed -i.bak -E "s|${RES_DIR}/${NAME}(\.[a-fA-F0-9]+)?${EXT}|${RES_DIR}/${NEW_FILE_NAME}|g" "$BUILD_DIR/$INDEX_FILE"
        rm -f "$BUILD_DIR/$INDEX_FILE.bak"
    else
        echo "[WARN] File not found: $SRC_PATH - Skipping."
    fi
done

echo "--------------------------------------------------"
echo "[BUILD] Production build created in '$BUILD_DIR'!"