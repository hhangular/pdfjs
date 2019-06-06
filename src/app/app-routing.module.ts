import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomepageComponent} from './main/homepage.component';

const routes: Routes = [
  {path: '', redirectTo: '/main', pathMatch: 'full'},
  {path: 'main', component: HomepageComponent},
  {path: 'demo', loadChildren: './demo/demo.module#DemoModule'},
  {path: 'doc', loadChildren: './doc/doc.module#DocModule'},
];

@NgModule({
  exports: [
    RouterModule,
  ],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
  ],
  declarations: [],
})
export class AppRoutingModule {
}
