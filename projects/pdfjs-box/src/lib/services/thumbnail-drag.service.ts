import {Injectable} from '@angular/core';
import {PdfjsItem, ThumbnailDragMode, ThumbnailLayout} from '../classes/pdfjs-objects';
import {PdfjsControl} from '../classes/pdfjs-control';
import {PdfjsThumbnailsComponent} from '../components/pdfjs-thumbnails/pdfjs-thumbnails.component';

@Injectable({
  providedIn: 'root'
})
export class ThumbnailDragService {
  private static thumbnails: PdfjsThumbnailsComponent[] = [];
  private static mode: ThumbnailDragMode = ThumbnailDragMode.NONE;
  private static sourceItem: PdfjsItem = null;
  private static sourcePdfjsControl: PdfjsControl = null;
  private static initialPosition: number = -1;
  private static targetPdfjsControl: PdfjsControl = null;
  private static targetItem: PdfjsItem = null;

  constructor() {
  }

  initDataTransfer(item: PdfjsItem, pdfjsControl: PdfjsControl, idx: number, mode: ThumbnailDragMode) {
    ThumbnailDragService.mode = mode;
    ThumbnailDragService.sourceItem = item;
    ThumbnailDragService.initialPosition = idx;
    ThumbnailDragService.sourcePdfjsControl = pdfjsControl;
    ThumbnailDragService.targetItem = null;
    ThumbnailDragService.targetPdfjsControl = null;
  }

  dataTransferInitiated(): boolean {
    return !!ThumbnailDragService.sourceItem;
  }

  applyItemToTargetPdfControl(pdfjsControl: PdfjsControl) {
    ThumbnailDragService.targetPdfjsControl = pdfjsControl;
    ThumbnailDragService.targetItem = ThumbnailDragService.sourceItem.clone();
  }

  getModeDataTransfer() {
    return ThumbnailDragService.mode;
  }

  getSourceItem() {
    return ThumbnailDragService.sourceItem;
  }

  getTargetItem() {
    return ThumbnailDragService.targetItem;
  }

  getSourceControl() {
    return ThumbnailDragService.sourcePdfjsControl;
  }

  getTargetControl() {
    return ThumbnailDragService.targetPdfjsControl;
  }

  getSourcePdfId(): string {
    if (!!ThumbnailDragService.sourcePdfjsControl) {
      return ThumbnailDragService.sourceItem.pdfId;
    }
    return null;
  }

  getTargetPdfId(): string {
    if (ThumbnailDragService.targetPdfjsControl) {
      return ThumbnailDragService.targetItem.pdfId;
    }
    return null;
  }

  getIndexOfItemTarget(): number {
    if (!!ThumbnailDragService.targetPdfjsControl) {
      return ThumbnailDragService.targetPdfjsControl.indexOfItem(ThumbnailDragService.targetItem);
    }
    return -1;
  }

  removeItemFromSource() {
    if (!!ThumbnailDragService.sourcePdfjsControl) {
      ThumbnailDragService.sourcePdfjsControl.removeItem(ThumbnailDragService.sourceItem);
    }
  }

  addItemToTarget(idx?: number) {
    if (!!ThumbnailDragService.targetPdfjsControl) {
      ThumbnailDragService.targetPdfjsControl.addItem(ThumbnailDragService.targetItem, idx);
    }
  }

  removeItemFromTarget() {
    let item: PdfjsItem = null;
    if (!!ThumbnailDragService.targetPdfjsControl) {
      ThumbnailDragService.targetPdfjsControl.removeItem(ThumbnailDragService.targetItem);
      item = ThumbnailDragService.targetItem;
    }
    return item;
  }

  restoreSource() {
    if (!!ThumbnailDragService.targetPdfjsControl && !!ThumbnailDragService.targetItem) {
      ThumbnailDragService.targetPdfjsControl.removeItem(ThumbnailDragService.targetItem);
      ThumbnailDragService.sourcePdfjsControl.addItem(ThumbnailDragService.sourceItem, ThumbnailDragService.initialPosition);
    }
    this.invalidTarget();
  }

  invalidSource() {
    ThumbnailDragService.mode = null;
    ThumbnailDragService.sourcePdfjsControl = null;
    ThumbnailDragService.sourceItem = null;
  }

  invalidTarget() {
    ThumbnailDragService.targetPdfjsControl = null;
    ThumbnailDragService.targetItem = null;
  }

  getTargetItemsLength() {
    if (ThumbnailDragService.targetPdfjsControl) {
      return ThumbnailDragService.targetPdfjsControl.getItemsLength();
    }
    return -1;
  }

  stopMoving() {
    this.invalidSource();
    this.invalidTarget();
  }

  getFirstParentElementNamed(target: HTMLElement, nodeName: string): HTMLElement {
    if (!target) {
      return null;
    }
    if (target.nodeName.toLowerCase() === nodeName) {
      return target;
    } else {
      return this.getFirstParentElementNamed(target.parentElement, nodeName);
    }
  }

  getIndexOfThumbnailInThumbnails(thumbnail: HTMLElement, thumbnails: HTMLElement) {
    return [].findIndex.call(thumbnails.children, (child: HTMLElement, idx: number) => {
      return child === thumbnail;
    });
  }

  isBeforeThumbnailOver(layout: ThumbnailLayout, thumbnailOver: HTMLElement, event: DragEvent) {
    if (layout === ThumbnailLayout.HORIZONTAL) {
      const median: number = this.getHMedian(thumbnailOver.getClientRects()[0]);
      return event.clientX < median;
    } else {
      const median: number = this.getVMedian(thumbnailOver.getClientRects()[0]);
      return event.clientY < median;
    }
  }

  getHMedian(clientRect: ClientRect) {
    return ((clientRect.right - clientRect.left) / 2) + clientRect.left;
  }

  getVMedian(clientRect: ClientRect) {
    return ((clientRect.bottom - clientRect.top) / 2) + clientRect.top;
  }

  registerDropThumbnails(thumbnails: PdfjsThumbnailsComponent) {
    if (thumbnails.allowDrop) {
      ThumbnailDragService.thumbnails.push(thumbnails);
    }
  }

  unregisterDropThumbnails(thumbnails: PdfjsThumbnailsComponent) {
    const idx = ThumbnailDragService.thumbnails.indexOf(thumbnails);
    if (idx !== -1) {
      ThumbnailDragService.thumbnails = ThumbnailDragService.thumbnails.splice(idx, 1);
    }
  }

  getComponentAcceptDrop(thumbnails: HTMLElement): PdfjsThumbnailsComponent {
    return ThumbnailDragService.thumbnails.find((comp: PdfjsThumbnailsComponent) => {
      return comp.elementRef.nativeElement === thumbnails;
    });
  }
}
