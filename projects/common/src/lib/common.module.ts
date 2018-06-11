import { NgModule } from '@angular/core';
import {ConfigService} from './config.service';
import {LoggerService} from './logger.service';

@NgModule({
  imports: [
  ],
  declarations: [],
  exports: [],
  providers: [
    ConfigService,
    LoggerService
  ],
})
export class CommonModule { }
