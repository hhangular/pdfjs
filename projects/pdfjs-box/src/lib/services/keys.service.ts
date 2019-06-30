import {Injectable} from '@angular/core';
import {PdfjsControl} from '../classes/pdfjs-control';

@Injectable()
export class KeysService {

  private static pdfjsControl: PdfjsControl = null;

  public setPdfjsControl(pdfjsControl: PdfjsControl) {
    KeysService.pdfjsControl = pdfjsControl;
  }

  public clearPdfjsControl() {
    KeysService.pdfjsControl = null;
  }

  public selectFirst() {
    KeysService.pdfjsControl ? KeysService.pdfjsControl.selectFirst() : this.doNothing();
  }

  public selectPrevious() {
    KeysService.pdfjsControl ? KeysService.pdfjsControl.selectPrevious() : this.doNothing();
  }

  public selectNext() {
    KeysService.pdfjsControl ? KeysService.pdfjsControl.selectNext() : this.doNothing();
  }

  public selectLast() {
    KeysService.pdfjsControl ? KeysService.pdfjsControl.selectLast() : this.doNothing();
  }

  private doNothing() {
  }
}
