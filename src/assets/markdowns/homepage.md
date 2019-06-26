# pdfjs [![Build Status](https://travis-ci.org/hhangular/pdfjs.svg?branch=master)](https://travis-ci.org/hhangular/pdfjs)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.0.0.

It's a collection of modules for angular 8x

## Modules
  - pdfjs-box : pdf viewer

### pdfjs-box

pdfjs-box is implementation of pdfjs-box for angular 8x. It contains some components for use easily the [mozilla pdf viewer pdfjs](https://github.com/mozilla/pdf.js).

### dependencies

Peer dependencies will be imported with @hhangular/pdfjs

  - pdfjs-dist
  - @types/pdfjs-dist

## installation

```javascript
npm install @hhangular/pdfjs --save
```

## use

Add assets pdfworker in angular.json

```javascript
{
  ...
  "projects": {
    "YOUR PROJECT": {
      ...
      "architect": {
        "build": {
          ...
          "options": {
            ...
            "assets": [
              { 
                "glob": "pdf.worker.js", 
                "input": "./node_modules/pdfjs-dist/build", 
                "output": "/assets" 
              },
              ...
```

### In application module add PdfjsBoxModule and configure worker

```javascript
@NgModule({
...
imports: [
    BrowserModule,
    PdfjsBoxModule.forRoot({workerSrc: 'assets/pdf.worker.js'})
  ],
...
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

### Components
  - pdfjs-thumbnails
  - pdfjs-view

### Control
  - pdfjsControl
  - pdfjsGroupControl

### objects

  - pdfjsItem



