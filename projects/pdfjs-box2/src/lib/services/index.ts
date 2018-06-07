import {LoggerService} from './logger.service';
import {Pdfjs} from './pdfjs.service';
import {ConfigurationService} from './configuration.service';
import {IdService} from './id.service';
import {ThumbnailDragService} from './thumbnail-drag.service';

export const PDFJSBOX_SERVICES  = [
  LoggerService,
  Pdfjs,
  ConfigurationService,
  IdService,
  ThumbnailDragService,
];
export {LoggerService} from './logger.service';
export {Pdfjs} from './pdfjs.service';
export {ConfigurationService} from './configuration.service';
export {IdService} from './id.service';
export {ThumbnailDragService} from './thumbnail-drag.service';
