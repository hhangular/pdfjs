import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {GithubService} from './github.service';
import {HomepageComponent} from './main/homepage.component';
import {NavBarComponent} from './navbar/navbar.component';
import {SharedModule} from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    NavBarComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    SharedModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
  ],
  providers: [GithubService],
  bootstrap: [AppComponent],
  entryComponents: [],
})
export class AppModule {
}
