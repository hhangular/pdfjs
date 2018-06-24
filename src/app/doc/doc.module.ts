import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DocRoutingModule} from './doc-routing.module';
import {DocComponent} from './doc.component';
import {SharedModule} from '../shared/shared.module';
import {SidenavComponent} from './sidenav/sidenav.component';
import {SECTIONS} from './sections';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DocRoutingModule
  ],
  exports: [
  ],
  declarations: [
    DocComponent,
    SECTIONS,
    SidenavComponent
  ],
  providers: [  ]
})
export class DocModule {}
