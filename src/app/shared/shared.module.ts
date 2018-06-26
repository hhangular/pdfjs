import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTabsModule, MatButtonModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatInputModule, MatListModule, MatMenuModule, MatSidenavModule, MatToolbarModule, MatTreeModule} from '@angular/material';
import {ScrollDispatchModule} from '@angular/cdk/scrolling';
import {NgxMdModule} from 'ngx-md';
import {FlexLayoutModule} from '@angular/flex-layout';
import {PdfjsBoxModule} from '../../../projects/pdfjs-box/src/lib/pdfjs-box.module';

const MODULES: any[] = [
  FlexLayoutModule,
  MatTabsModule,
  ScrollDispatchModule,
  MatButtonModule,
  MatListModule,
  MatMenuModule,
  MatToolbarModule,
  MatSidenavModule,
  MatTreeModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule
];


@NgModule({
  imports: [
    CommonModule,
    MODULES,
    NgxMdModule.forRoot(),
    PdfjsBoxModule.forRoot({workerSrc: 'assets/pdf.worker.js'}),
  ],
  exports: [
    MODULES,
    NgxMdModule,
    PdfjsBoxModule
  ],
  declarations: []
})
export class SharedModule {
}
