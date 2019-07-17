import {Injectable} from '@angular/core';
import {PdfjsControl} from '../classes/pdfjs-control';
import {ThumbnailDragMode, ThumbnailLayout} from '../classes/pdfjs-objects';
import {PdfjsThumbnailsComponent} from '../components/pdfjs-thumbnails/pdfjs-thumbnails.component';
import {PdfjsItem} from '../classes/pdfjs-item';

@Injectable({
  providedIn: 'root',
})
export class ThumbnailDragService {
  private static thumbnails: PdfjsThumbnailsComponent[] = [];
  private static mode: ThumbnailDragMode = ThumbnailDragMode.NONE;
  private static sourceItem: PdfjsItem = null;
  private static sourcePdfjsControl: PdfjsControl = null;
  private static initialPosition = -1;
  private static targetPdfjsControl: PdfjsControl = null;
  private static targetItem: PdfjsItem = null;

  public initDataTransfer(item: PdfjsItem, pdfjsControl: PdfjsControl, idx: number, mode: ThumbnailDragMode) {
    ThumbnailDragService.mode = mode;
    ThumbnailDragService.sourceItem = item;
    ThumbnailDragService.initialPosition = idx;
    ThumbnailDragService.sourcePdfjsControl = pdfjsControl;
    ThumbnailDragService.targetItem = null;
    ThumbnailDragService.targetPdfjsControl = null;
  }

  public dataTransferInitiated(): boolean {
    return !!ThumbnailDragService.sourceItem;
  }

  public applyItemToTargetPdfControl(pdfjsControl: PdfjsControl) {
    ThumbnailDragService.targetPdfjsControl = pdfjsControl;
    ThumbnailDragService.targetItem = ThumbnailDragService.sourceItem.clone();
  }

  public getModeDataTransfer() {
    return ThumbnailDragService.mode;
  }

  public getSourceItem() {
    return ThumbnailDragService.sourceItem;
  }

  public getTargetItem() {
    return ThumbnailDragService.targetItem;
  }

  public getSourceControl() {
    return ThumbnailDragService.sourcePdfjsControl;
  }

  public getTargetControl() {
    return ThumbnailDragService.targetPdfjsControl;
  }

  public getSourcePdfId(): string {
    if (!!ThumbnailDragService.sourcePdfjsControl) {
      return ThumbnailDragService.sourceItem.pdfId;
    }
    return null;
  }

  public getTargetPdfId(): string {
    if (ThumbnailDragService.targetPdfjsControl) {
      return ThumbnailDragService.targetItem.pdfId;
    }
    return null;
  }

  public getIndexOfItemTarget(): number {
    if (!!ThumbnailDragService.targetPdfjsControl) {
      return ThumbnailDragService.targetPdfjsControl.indexOfItem(ThumbnailDragService.targetItem);
    }
    return -1;
  }

  public removeItemFromSource() {
    if (!!ThumbnailDragService.sourcePdfjsControl) {
      ThumbnailDragService.sourcePdfjsControl.removeItem(ThumbnailDragService.sourceItem);
    }
  }

  public addItemToTarget(idx?: number) {
    if (!!ThumbnailDragService.targetPdfjsControl) {
      ThumbnailDragService.targetPdfjsControl.addItem(ThumbnailDragService.targetItem, idx);
    }
  }

  public removeItemFromTarget() {
    let item: PdfjsItem = null;
    if (!!ThumbnailDragService.targetPdfjsControl) {
      ThumbnailDragService.targetPdfjsControl.removeItem(ThumbnailDragService.targetItem);
      item = ThumbnailDragService.targetItem;
    }
    return item;
  }

  public restoreSource() {
    if (!!ThumbnailDragService.targetPdfjsControl && !!ThumbnailDragService.targetItem) {
      ThumbnailDragService.targetPdfjsControl.removeItem(ThumbnailDragService.targetItem);
      ThumbnailDragService.sourcePdfjsControl.addItem(ThumbnailDragService.sourceItem, ThumbnailDragService.initialPosition);
    }
    this.invalidTarget();
  }

  public invalidSource() {
    ThumbnailDragService.mode = null;
    ThumbnailDragService.sourcePdfjsControl = null;
    ThumbnailDragService.sourceItem = null;
  }

  public invalidTarget() {
    ThumbnailDragService.targetPdfjsControl = null;
    ThumbnailDragService.targetItem = null;
  }

  public getTargetItemsLength() {
    if (ThumbnailDragService.targetPdfjsControl) {
      return ThumbnailDragService.targetPdfjsControl.getPageNumber();
    }
    return NaN;
  }

  public stopMoving() {
    this.invalidSource();
    this.invalidTarget();
  }

  public getFirstParentThumbnail(target: HTMLElement): HTMLElement {
    return this.getFirstParentElementNamed(target, 'pdfjs-thumbnail');
  }

  public getFirstParentThumbnails(target: HTMLElement): HTMLElement {
    return this.getFirstParentElementNamed(target, 'pdfjs-thumbnails');
  }

  private getFirstParentElementNamed(target: HTMLElement, nodeName: string): HTMLElement {
    if (!target) {
      return null;
    }
    if (target.nodeName.toLowerCase() === nodeName) {
      return target;
    } else {
      return this.getFirstParentElementNamed(target.parentElement, nodeName);
    }
  }

  public getIndexOfThumbnailInThumbnails(thumbnail: HTMLElement, thumbnails: HTMLElement) {
    return [].findIndex.call(thumbnails.children, (child: HTMLElement, idx: number) => {
      return child === thumbnail;
    });
  }

  private isBeforeThumbnailOver(layout: ThumbnailLayout, thumbnailOver: HTMLElement, event: DragEvent) {
    if (layout === ThumbnailLayout.HORIZONTAL) {
      const median: number = this.getHMedian(thumbnailOver.getClientRects()[0]);
      return event.clientX < median;
    } else {
      const median: number = this.getVMedian(thumbnailOver.getClientRects()[0]);
      return event.clientY < median;
    }
  }

  private getHMedian(clientRect: ClientRect) {
    return ((clientRect.right - clientRect.left) / 2) + clientRect.left;
  }

  private getVMedian(clientRect: ClientRect) {
    return ((clientRect.bottom - clientRect.top) / 2) + clientRect.top;
  }

  public registerDropThumbnails(thumbnails: PdfjsThumbnailsComponent) {
    if (thumbnails.allowDrop) {
      const idx = ThumbnailDragService.thumbnails.indexOf(thumbnails);
      if (idx === -1) {
        ThumbnailDragService.thumbnails.push(thumbnails);
      }
    }
  }

  public unregisterDropThumbnails(thumbnails: PdfjsThumbnailsComponent) {
    const idx = ThumbnailDragService.thumbnails.indexOf(thumbnails);
    if (idx !== -1) {
      ThumbnailDragService.thumbnails.splice(idx, 1);
    }
  }

  public getComponentAcceptDrop(thumbnails: HTMLElement): PdfjsThumbnailsComponent {
    return ThumbnailDragService.thumbnails.find((comp: PdfjsThumbnailsComponent) => {
      return comp.elementRef.nativeElement === thumbnails;
    });
  }
}
