#! /bin/bash

echo "✅ Done"
echo "Transpiling transcript"
npx tsc 
echo "✅ Done"
echo "Copying files for publishing to the dist folder..."
cp package.json dist/package.json
cp README.md dist/README.md
cp LICENSE dist/LICENSE
echo "✅ Done"
