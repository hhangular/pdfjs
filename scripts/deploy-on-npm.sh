#!bin/bash
echo publish on npm $1, use authToken in .npmrc
npm publish dist/$1

echo Prepare next number version
cd projects/pdfjs-box
npm version patch

echo Push next number version
cd ../..
git commit -m "[ci skip]" projects/pdfjs-box/package.json
