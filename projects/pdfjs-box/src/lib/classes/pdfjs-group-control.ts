import {BehaviorSubject, Subject} from 'rxjs';
import {PdfjsCommand} from './pdfjs-command';
import {PdfjsControl} from './pdfjs-control';

export class PdfjsGroupControl implements PdfjsCommand {

  public disabled = true;

  public selectedPdfjsControl$: BehaviorSubject<PdfjsControl> = new BehaviorSubject(null);
  private selectedPdfjsControl: PdfjsControl = null;

  public select(pdfjsControl: PdfjsControl) {
    this.selectedPdfjsControl = pdfjsControl;
    this.disabled = !pdfjsControl;
    this.selectedPdfjsControl$.next(pdfjsControl);
  }

  public isSelected(pdfjsControl: PdfjsControl): boolean {
    return this.selectedPdfjsControl === pdfjsControl;
  }

  public fit() {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.fit();
    }
  }

  public getNumberOfPages(): number {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.getNumberOfPages();
    }
    return 0;
  }

  public getPageIndex(): number {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.getPageIndex();
    }
    return NaN;
  }

  public hasNext(): boolean {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.hasNext();
    }
    return false;
  }

  public hasPrevious(): boolean {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.hasPrevious();
    }
    return false;
  }

  public reload() {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.reload();
    }
  }

  public rotate(angle: number) {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.rotate(angle);
    }
  }

  public rotateSelected(angle: number) {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.rotateSelected(angle);
    }
  }

  public selectFirst() {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.selectFirst();
    }
  }

  public selectLast() {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.selectLast();
    }
  }

  public selectNext() {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.selectNext();
    }
  }

  public selectPrevious() {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.selectPrevious();
    }
  }

  public zoom(zoom: number) {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.zoom(zoom);
    }
  }
}
