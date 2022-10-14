#! /bin/bash

cd dist/
echo "Running npm link inside the follow path:" 
echo &(pwd)
npm link
echo "Done ✅"
