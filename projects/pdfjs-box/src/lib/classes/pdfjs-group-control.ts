import {PdfjsControl} from './pdfjs-control';
import {Subject} from 'rxjs';
import {PdfjsCommand} from './pdfjs-command';

export class PdfjsGroupControl implements PdfjsCommand {
  private selectedPdfjsControl: PdfjsControl = null;

  disabled = true;

  selectedPdfjsControl$: Subject<PdfjsControl> = new Subject();

  select(pdfjsControl: PdfjsControl) {
    this.selectedPdfjsControl = pdfjsControl;
    this.disabled = !pdfjsControl;
    this.selectedPdfjsControl$.next(pdfjsControl);
  }

  isSelected(pdfjsControl: PdfjsControl): boolean {
    return this.selectedPdfjsControl === pdfjsControl;
  }

  fit() {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.fit();
    }
  }

  getNumberOfPages(): number {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.getNumberOfPages();
    }
    return 0;
  }

  getPageIndex(): number {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.getPageIndex();
    }
    return NaN;
  }

  hasNext(): boolean {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.hasNext();
    }
    return false;
  }

  hasPrevious(): boolean {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.hasPrevious();
    }
    return false;
  }

  reload() {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.reload();
    }
  }

  rotate(angle: number) {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.rotate(angle);
    }
  }

  rotateSelected(angle: number) {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.rotateSelected(angle);
    }
  }

  selectFirst() {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.selectFirst();
    }
  }

  selectLast() {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.selectLast();
    }
  }

  selectNext() {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.selectNext();
    }
  }

  selectPrevious() {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.selectPrevious();
    }
  }

  zoom(zoom: number) {
    if (!!this.selectedPdfjsControl) {
      this.selectedPdfjsControl.zoom(zoom);
    }
  }
}
