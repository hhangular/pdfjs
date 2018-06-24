## Configuration

### Add assets pdfworker in angular.json

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

```
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
