#! /bin/bash

echo "Deleting old package json in dist folder..."
rm dist/package.json
echo "✅ Done"
echo "Generating new package json to dist folder..."
cp package.json dist/package.json
echo "✅ Done"
