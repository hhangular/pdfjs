import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DemoRoutingModule} from './demo-routing.module';
import {DemoComponent} from './demo.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
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
