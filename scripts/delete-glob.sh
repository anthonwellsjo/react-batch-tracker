#! /bin/bash
pack_name=$(cat package.json | jq '.name')

echo "Deleting $pack_name globally"
npm uninstall -g $pack_name
echo "✅ done!"
