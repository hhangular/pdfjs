import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DemoRoutingModule} from './demo-routing.module';
import {DemoComponent} from './demo.component';
import {SharedModule} from '../shared/shared.module';
import {PdfjsBoxModule} from '../../../projects/pdfjs-box2/src/lib/pdfjs-box.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    PdfjsBoxModule.forRoot({workerSrc: 'assets/pdf.worker.js'}),
    DemoRoutingModule
  ],
  exports: [
    DemoRoutingModule
  ],
  declarations: [
    DemoComponent
  ]
})
export class DemoModule {
}
