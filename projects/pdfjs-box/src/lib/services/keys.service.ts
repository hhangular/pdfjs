import {Injectable} from '@angular/core';
import {PdfjsControl} from '../classes/pdfjs-control';

@Injectable()
export class KeysService {

  private static pdfjsControl: PdfjsControl = null;

  constructor() {
  }

  setPdfjsControl(pdfjsControl: PdfjsControl) {
    KeysService.pdfjsControl = pdfjsControl;
  }

  clearPdfjsControl() {
    KeysService.pdfjsControl = null;
  }

  selectFirst() {
    KeysService.pdfjsControl ? KeysService.pdfjsControl.selectFirst() : this.doNothing();
  }

  selectPrevious() {
    KeysService.pdfjsControl ? KeysService.pdfjsControl.selectPrevious() : this.doNothing();
  }

  selectNext() {
    KeysService.pdfjsControl ? KeysService.pdfjsControl.selectNext() : this.doNothing();
  }

  selectLast() {
    KeysService.pdfjsControl ? KeysService.pdfjsControl.selectLast() : this.doNothing();
  }

  private doNothing() {
  }
}
