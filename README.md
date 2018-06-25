# pdfjs

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.0.

It's a collection of modules for angular 6x

## Modules
  - pdfjs-box : pdf viewer

###pdfjs-box

pdfjs-box is implementation of pdfjs-box for angular 2x. It contains some components for use easily the [mozilla pdf viewer pdfjs](https://github.com/mozilla/pdf.js).

### dependencies
  - pdfjs-dist
  - @types/pdfjs-dist

## installation

```
npm install pdfjs-dist --save
npm install @types/pdfjs-dist --save
npm install @hhangular/pdfjs --save
```

## use

Add assets pdfworker in angular.json

```json
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

```typescript
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

