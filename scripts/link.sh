#! /bin/bash

cd dist/
echo "Running npm link inside the follow path:" 
echo &(pwd)
npm link
echo "✅ Done"
echo "These packages are currently linked:"
npm ls -g --depth=0 --link=true
