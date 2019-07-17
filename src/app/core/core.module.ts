import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {GithubService} from './github.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  exports: [
  ],
  providers: [GithubService],
  declarations: [],
})
export class CoreModule {
}
