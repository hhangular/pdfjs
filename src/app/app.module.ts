import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {PdfjsBoxModule} from '../../projects/pdfjs-box2/src/lib/pdfjs-box.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatToolbarModule,
    PdfjsBoxModule.forRoot({workerSrc: 'assets/pdf.worker.js'})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
