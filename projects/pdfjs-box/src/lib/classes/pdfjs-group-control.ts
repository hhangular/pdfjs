import {BehaviorSubject} from 'rxjs';
import {PdfjsCommand} from './pdfjs-command';
import {PdfjsControl} from './pdfjs-control';
import {PDFPromiseResolved} from './pdfjs-objects';
import {PDFPromise} from 'pdfjs-dist';

export class PdfjsGroupControl implements PdfjsCommand {

  public get disabled(): boolean {
    return !this.selectedPdfjsControl || isNaN(this.getSelectedPageIndex());
  }

  public selectedPdfjsControl$: BehaviorSubject<PdfjsControl> = new BehaviorSubject(null);
  private selectedPdfjsControl: PdfjsControl = null;

  public selectControl(pdfjsControl: PdfjsControl) {
    this.selectedPdfjsControl = pdfjsControl;
    this.selectedPdfjsControl$.next(pdfjsControl);
  }
  public unselectControl() {
    this.selectedPdfjsControl = null;
    this.selectedPdfjsControl$.next(null);
  }

  public isControlSelected(pdfjsControl: PdfjsControl): boolean {
    return this.selectedPdfjsControl === pdfjsControl;
  }

  public getPageNumber(): number {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.getPageNumber();
    }
    return 0;
  }

  public getSelectedPageIndex(): number {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.getSelectedPageIndex();
    }
    return NaN;
  }

  public getSelectedItemIndex(): number {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.getSelectedItemIndex();
    }
    return NaN;
  }

  public nextIsSelectable(): boolean {
    return !!this.selectedPdfjsControl && this.selectedPdfjsControl.nextIsSelectable();
  }

  public previousIsSelectable(): boolean {
    return !!this.selectedPdfjsControl && this.selectedPdfjsControl.previousIsSelectable();
  }

  public reload(): PDFPromise<number> {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.reload();
    }
    return new PDFPromiseResolved(0);
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

  public selectItemIndex(index: number): number {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.selectItemIndex(index);
    }
    return NaN;
  }

  public selectFirst(): number {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.selectFirst();
    }
    return NaN;
  }

  public selectLast(): number {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.selectLast();
    }
    return NaN;
  }

  public selectNext(): number {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.selectNext();
    }
    return NaN;
  }

  public selectPrevious(): number {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.selectPrevious();
    }
    return NaN;
  }

  public unselect(): number {
    if (!!this.selectedPdfjsControl) {
      return this.selectedPdfjsControl.unselect();
    }
    return NaN;
  }
}
