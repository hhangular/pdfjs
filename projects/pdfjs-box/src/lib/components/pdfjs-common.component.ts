import {Component, ElementRef, HostListener} from '@angular/core';
import {PdfjsItem, ThumbnailDragMode, ThumbnailLayout} from '../classes/pdfjs-objects';
import {ThumbnailDragService} from '../services/thumbnail-drag.service';
import {Pdfjs} from '../services/pdfjs.service';
import {PdfAPI} from '../classes/pdfapi';
import {KeysService} from '../services/keys.service';
import {PdfjsThumbnailsComponent} from './pdfjs-thumbnails/pdfjs-thumbnails.component';
import {PdfjsThumbnailComponent} from './pdfjs-thumbnail/pdfjs-thumbnail.component';

export enum KEY_CODE {
  ARROW_LEFT = 37,
  ARROW_UP = 38,
  ARROW_RIGHT = 39,
  ARROW_DOWN = 40
}

@Component({
  selector: 'pdfjs-common',
  template: ``
})
export class PdfjsCommonComponent {
  API: PdfAPI;

  constructor(
    private pdfjs: Pdfjs,
    private elementRef: ElementRef,
    private thumbnailDragService: ThumbnailDragService,
    private keysService: KeysService
  ) {
    this.API = pdfjs.getApi();
  }

  @HostListener('document:click', ['$event'])
  onClickInDocument(event: MouseEvent) {
    this.keysService.clearPdfjsControl();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case KEY_CODE.ARROW_LEFT :
        event.ctrlKey ? this.keysService.selectFirst() : this.keysService.selectPrevious();
        break;
      case KEY_CODE.ARROW_UP :
        event.ctrlKey ? this.keysService.selectFirst() : this.keysService.selectPrevious();
        break;
      case KEY_CODE.ARROW_RIGHT :
        event.ctrlKey ? this.keysService.selectLast() : this.keysService.selectNext();
        break;
      case KEY_CODE.ARROW_DOWN :
        event.ctrlKey ? this.keysService.selectLast() : this.keysService.selectNext();
        break;
    }
  }

  /**
   * On drag in the document
   */
  @HostListener('document:dragover', ['$event'])
  @HostListener('document:dragenter', ['$event'])
  onDragOverInDocument(event: DragEvent) {
    if (event.preventDefault) {
      event.preventDefault(); // Necessary. Allows us to drop.
    }
    // considerate only item drag
    if (this.thumbnailDragService.dataTransferInitiated()) {
      const containerOver: HTMLElement = this.getThumbnailContainerOver(event.target);
      const pdfjsThumbnailsComponent: PdfjsThumbnailsComponent = this.thumbnailDragService.getComponentAcceptDrop(containerOver);
      // over a thumbnails container and it accepts drop items
      if (!!pdfjsThumbnailsComponent) {
        this.onDragOverContainer(event, containerOver);
      } else {
        this.onDragOutContainer(event);
      }
    }
  }

  /**
   * Drag item in container
   */
  onDragOverContainer(event: DragEvent, containerOver: HTMLElement) {
    // item is anywhere yet
    if (!this.thumbnailDragService.getTargetPdfId()) {
      this.onDragOverContainerAndItemNowhere(event, containerOver);
    } else {
      this.onDragOverContainerAndItemSomewhere(event, containerOver);
    }
  }

  /**
   * Drag out Container
   */
  onDragOutContainer(event: DragEvent) {
    if (this.thumbnailDragService.getTargetPdfId()) {
      this.thumbnailDragService.restoreSource();
    } else {
      this.thumbnailDragService.invalidTarget();
      //  Drag not over one container and item not already somewhere, do nothing
    }
  }

  /**
   * Drag in container, so move item
   */
  onDragOverContainerAndItemSomewhere(event: DragEvent, containerOver: HTMLElement) {
    const pdfjsThumbnailsComponent: PdfjsThumbnailsComponent = this.thumbnailDragService.getComponentAcceptDrop(containerOver);
    if (pdfjsThumbnailsComponent.pdfjsControl !== this.thumbnailDragService.getTargetControl()) {
      // change container
      this.thumbnailDragService.restoreSource();
      this.onDragOverContainerAndItemNowhere(event, containerOver);
    } else {
      // change position
      this.onDragOverContainerAndItemSomewhereInIt(event, containerOver);
    }
  }

  /**
   * Drag in the same container
   */
  onDragOverContainerAndItemSomewhereInIt(event: DragEvent, containerOver: HTMLElement) {
    const thumbnailOver: HTMLElement = this.getThumbnailOver(event.toElement);
    const pdfjsThumbnailsComponent: PdfjsThumbnailsComponent = this.thumbnailDragService.getComponentAcceptDrop(containerOver);
    if (thumbnailOver) { // over an other thumbnail
      const currentPosition = this.thumbnailDragService.getIndexOfItemTarget();
      const idx: number = this.thumbnailDragService.getIndexOfThumbnailInThumbnails(thumbnailOver, containerOver);
      if (currentPosition !== idx) { // not over the same
        let newPos: number = idx + this.getPositionFix(event, pdfjsThumbnailsComponent.layout, thumbnailOver, true);
        if (currentPosition !== newPos) { // move to new place
          this.thumbnailDragService.removeItemFromTarget();
          if (currentPosition < idx) {
            newPos--;
          }
          this.thumbnailDragService.addItemToTarget(newPos);
        }
      }
    } else {
      this.thumbnailDragService.addItemToTarget();
    }
  }

  /**
   * Drag in other container
   */
  onDragOverContainerAndItemSomewhereInOtherContainer(event: DragEvent) {

  }

  getInsertionPosition(): number {
    return 0;
  }

  onDragOverContainerAndItemNowhere(event: DragEvent, containerOver: HTMLElement) {
    const thumbnailOver: HTMLElement = this.getThumbnailOver(event.toElement);
    const pdfjsThumbnailsComponent: PdfjsThumbnailsComponent = this.thumbnailDragService.getComponentAcceptDrop(containerOver);
    this.thumbnailDragService.applyItemToTargetPdfControl(pdfjsThumbnailsComponent.pdfjsControl);
    if (thumbnailOver) { // over an other thumbnail
      const fix = this.getPositionFix(event, pdfjsThumbnailsComponent.layout, thumbnailOver, true);
      const idx: number = this.thumbnailDragService.getIndexOfThumbnailInThumbnails(thumbnailOver, containerOver);
      console.log('onDragOverContainerAndItemNowhere addAround', event.toElement, idx, fix);
      this.thumbnailDragService.addItemToTarget(idx + fix);
    } else {
      console.log('onDragOverContainerAndItemNowhere add');
      this.thumbnailDragService.addItemToTarget();
    }
  }

  onDragOverInDocument_old(event: DragEvent) {
    if (event.preventDefault) {
      event.preventDefault(); // Necessary. Allows us to drop.
    }
    event.dataTransfer.dropEffect = 'move';
    if (this.thumbnailDragService.dataTransferInitiated()) {
      const thumbnailsOver: HTMLElement = this.getThumbnailContainerOver(event.target);
      if (!!thumbnailsOver) {
        const pdfjsThumbnailsComponent: PdfjsThumbnailsComponent = this.thumbnailDragService.getComponentAcceptDrop(thumbnailsOver);
        if (!this.thumbnailDragService.getTargetPdfId()) { // not yet copy in the other thumbnails
          this.notYetCopyInThumbnails(pdfjsThumbnailsComponent, thumbnailsOver, event);
        } else { // already initiated
          this.alreadyCopyInThumbnails(pdfjsThumbnailsComponent, thumbnailsOver, event);
        }
      } else {
        this.thumbnailDragService.removeItemFromTarget();
      }
    }
  }

  /**
   * Target not yet initiated
   */
  private notYetCopyInThumbnails(pdfjsThumbnailsComponent: PdfjsThumbnailsComponent, thumbnailsOver: HTMLElement, event: DragEvent) {
    const item: PdfjsItem = this.thumbnailDragService.getSourceItem();
    if (pdfjsThumbnailsComponent) { // over drop thumbnailsOver
      this.thumbnailDragService.applyItemToTargetPdfControl(pdfjsThumbnailsComponent.pdfjsControl);
      const thumbnailOver: HTMLElement = this.getThumbnailOver(event.toElement);
      if (thumbnailOver) { // over an other thumbnail (not yet copy, so...)
        this.addAroundAnOtherThumbnail(pdfjsThumbnailsComponent.layout, thumbnailsOver, thumbnailOver, event);
      } else { // not over an other thumbnail, add at the end
        this.thumbnailDragService.addItemToTarget();
      }
    } // not over drop thumbnailsOver
  }

  /**
   * Add targetItem in list, before or after thumbnail over in thumbnailsOver
   */
  private addAroundAnOtherThumbnail(layout: ThumbnailLayout, thumbnailsOver: HTMLElement, thumbnailOver: HTMLElement, event: DragEvent) {
    const idx: number = this.thumbnailDragService.getIndexOfThumbnailInThumbnails(thumbnailOver, thumbnailsOver);
    if (this.thumbnailDragService.isBeforeThumbnailOver(layout, thumbnailOver, event)) {
      this.thumbnailDragService.addItemToTarget(idx);
    } else {
      this.thumbnailDragService.addItemToTarget(idx + 1);
    }
  }

  /**
   * Compute if the thumbnail have to insert
   */
  getPositionFix($event: MouseEvent, layout: ThumbnailLayout, thumbnail: HTMLElement, debug: boolean) {
    thumbnail.classList.remove('hover-right');
    thumbnail.classList.remove('hover-left');
    thumbnail.classList.remove('hover-bottom');
    thumbnail.classList.remove('hover-top');
    let position = 0;
    let overAt: string;
    const rectList: DOMRectList = thumbnail.getClientRects() as DOMRectList;
    const r: DOMRect = rectList[0];
    if (layout === ThumbnailLayout.HORIZONTAL) {
      if ($event.clientX > (r.left + r.width / 2)) { // right
        overAt = 'right';
        position = 1;
      } else {
        overAt = 'left';
      }
    } else {
      if ($event.clientY > (r.top + r.height / 2)) { // bottom
        overAt = 'bottom';
        position = 1;
      } else {
        overAt = 'top';
      }
    }
    if (debug) {
      thumbnail.classList.add(`hover-${overAt}`);
    }
    return position;
  }

  private alreadyCopyInThumbnails(pdfjsThumbnailsComponent: PdfjsThumbnailsComponent, thumbnailsOver: HTMLElement, event: DragEvent) {
    if (pdfjsThumbnailsComponent) { // in drop thumbnailsOver
      this.adjustTargetContainer(pdfjsThumbnailsComponent);
      const thumbnailOver: HTMLElement = this.getThumbnailOver(event.toElement);
      const currentIdx = this.thumbnailDragService.getIndexOfItemTarget();
      if (thumbnailOver) { // over other thumbnail
        const newIdx: number = this.thumbnailDragService.getIndexOfThumbnailInThumbnails(thumbnailOver, thumbnailsOver);
//        console.log(`au dessus d'une miniature index courant ${currentIdx}, index survolé ${newIdx}`);
        if (currentIdx !== newIdx) { // not over the same item
          this.thumbnailDragService.removeItemFromTarget();
          this.addAroundAnOtherThumbnail(pdfjsThumbnailsComponent.layout, thumbnailsOver, thumbnailOver, event);
        } // over the same item, do nothing
      } else {
        if (currentIdx === -1 || currentIdx !== (this.thumbnailDragService.getTargetItemsLength() - 1)) {
          this.thumbnailDragService.removeItemFromTarget();
          this.thumbnailDragService.addItemToTarget();
        }
      }
    } else { // out of thumbnailsOver
      if (this.thumbnailDragService.getSourcePdfId() !== this.thumbnailDragService.getTargetPdfId() ||
        this.thumbnailDragService.getModeDataTransfer() === ThumbnailDragMode.MOVE) {
        this.thumbnailDragService.removeItemFromTarget();
        this.thumbnailDragService.invalidTarget();
      }
    }
  }

  /**
   * current item was already copy or move, manage if we have to change container
   */
  private adjustTargetContainer(pdfjsThumbnailsComponent: PdfjsThumbnailsComponent) {
    if (pdfjsThumbnailsComponent.pdfjsControl.id !== this.thumbnailDragService.getTargetPdfId()) { // not same of previous
      const item: PdfjsItem = this.thumbnailDragService.getTargetItem();
      if (this.thumbnailDragService.getTargetPdfId() !== this.thumbnailDragService.getSourcePdfId() || this.thumbnailDragService.getModeDataTransfer() === ThumbnailDragMode.MOVE) {
        this.thumbnailDragService.removeItemFromTarget();
      }
      this.thumbnailDragService.applyItemToTargetPdfControl(pdfjsThumbnailsComponent.pdfjsControl);
    }
  }

  /**
   * get thumbnails element mouseover
   */
  private getThumbnailContainerOver(eventTarget: EventTarget): HTMLElement {
    return this.thumbnailDragService.getFirstParentElementNamed(eventTarget as HTMLElement, 'pdfjs-thumbnails');
  }

  /**
   * get thumbnail element mouseover
   */
  private getThumbnailOver(element: Element): HTMLElement {
    return this.thumbnailDragService.getFirstParentElementNamed(element as HTMLElement, 'pdfjs-thumbnail');
  }

  /**
   * Drop thumbnail in any element
   */
//  @HostListener('document:drop', ['$event'])
  onDropInDocument(event: DragEvent) {
    if (this.thumbnailDragService.dataTransferInitiated()) { // dataTransfer exist
      const thumbnails: HTMLElement = this.getThumbnailContainerOver(event.target);
      const pdfjsThumbnailsComponent: PdfjsThumbnailsComponent = this.thumbnailDragService.getComponentAcceptDrop(thumbnails);
      this.alreadyCopyInThumbnails(pdfjsThumbnailsComponent, thumbnails, event);
      this.thumbnailDragService.stopMoving();
    }
  }
}
