#!bin/bash

echo Build all lib in projects directory
for dir in projects/*
do
  echo ${dir}
  ng build ${dir} --prod
done

echo Build website
ng build --prod --base-href .

echo Duplicate index.html to 404.html
cp dist/pdfjs/index.html dist/pdfjs/404.html
