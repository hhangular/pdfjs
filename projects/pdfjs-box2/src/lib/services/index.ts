import {LoggerService} from './logger.service';
import {Pdfjs} from './pdfjs.service';
import {ConfigurationService} from './configuration.service';
import {ThumbnailDragService} from './thumbnail-drag.service';
import {KeysService} from './keys.service';

export const PDFJSBOX_SERVICES  = [
  LoggerService,
  Pdfjs,
  ConfigurationService,
  ThumbnailDragService,
  KeysService
];
export {LoggerService} from './logger.service';
export {Pdfjs} from './pdfjs.service';
export {ConfigurationService} from './configuration.service';
export {ThumbnailDragService} from './thumbnail-drag.service';
export {KeysService} from './keys.service';
