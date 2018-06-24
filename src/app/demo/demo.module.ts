import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DemoRoutingModule} from './demo-routing.module';
import {DemoComponent} from './demo.component';
import {PdfjsBoxModule} from '../../../projects/pdfjs-box2/src/lib/pdfjs-box.module';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DemoRoutingModule,
    PdfjsBoxModule.forRoot({workerSrc: 'assets/pdf.worker.js'}),
  ],
  exports: [
    DemoRoutingModule
  ],
  declarations: [
    DemoComponent
  ],
  providers: [  ]
})
export class DemoModule {}
