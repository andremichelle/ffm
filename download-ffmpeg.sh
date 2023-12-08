#!/bin/bash

TARGET="public/ffmpeg@0.12.4"

if [ ! -d "$TARGET" ]; then
  mkdir -p "$TARGET"
fi

echo "downloading ffmpeg runtime files..."
curl -sS -o"$TARGET/ffmpeg-core.js" https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/esm/ffmpeg-core.js
curl -sS -o"$TARGET/ffmpeg-core.wasm" https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/esm/ffmpeg-core.wasm
curl -sS -o"$TARGET/ffmpeg-core.worker.js" https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/esm/ffmpeg-core.worker.js