import {ScrollingModule} from '@angular/cdk/scrolling';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {
  MatCheckboxModule,
  MatSliderModule,
  MatRadioModule,
  MatButtonModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatSidenavModule,
  MatTabsModule,
  MatToolbarModule,
  MatTreeModule,
  MatTableModule
} from '@angular/material';
import {NgxMdModule} from 'ngx-md';
import {PdfjsBoxModule} from '../../../projects/pdfjs-box/src/lib/pdfjs-box.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
const MODULES: any[] = [
  FlexLayoutModule,
  MatTableModule,
  MatCheckboxModule,
  MatTabsModule,
  ScrollingModule,
  MatRadioModule,
  MatSliderModule,
  MatButtonModule,
  MatListModule,
  MatMenuModule,
  MatToolbarModule,
  MatSidenavModule,
  MatTreeModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  FontAwesomeModule,
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
    PdfjsBoxModule,
  ],
  declarations: [],
})
export class SharedModule {
}
