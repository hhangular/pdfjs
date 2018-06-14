import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {PdfjsBoxModule} from '../../projects/pdfjs-box2/src/lib/pdfjs-box.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {HHCommonModule} from '../../projects/hh-common/src/lib/hh-common.module';

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
    PdfjsBoxModule.forRoot({workerSrc: 'assets/pdf.worker.js'}),
    HHCommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
