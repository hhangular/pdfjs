import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {PdfjsBoxModule} from '../../projects/pdfjs-box2/src/lib/pdfjs-box2.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    PdfjsBoxModule.forRoot({workerSrc: 'assets/pdf.worker.js'})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
