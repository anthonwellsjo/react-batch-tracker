#! /bin/bash

echo "✅ Done"
echo "Transpiling transcript"
npx tsc 
echo "✅ Done"
echo "Generating new package json to dist folder..."
cp package.json dist/package.json
echo "✅ Done"
