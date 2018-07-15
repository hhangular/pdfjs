import {Component, ElementRef, HostListener} from '@angular/core';
import {ThumbnailLayout} from '../classes/pdfjs-objects';
import {ThumbnailDragService} from '../services/thumbnail-drag.service';
import {Pdfjs} from '../services/pdfjs.service';
import {PdfAPI} from '../classes/pdfapi';
import {KeysService} from '../services/keys.service';
import {PdfjsThumbnailsComponent} from './pdfjs-thumbnails/pdfjs-thumbnails.component';

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
  private static DEBUG_OVER = false;

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
      this.onDragOverNewContainer(event, containerOver);
    } else {
      const pdfjsThumbnailsComponent: PdfjsThumbnailsComponent = this.thumbnailDragService.getComponentAcceptDrop(containerOver);
      if (pdfjsThumbnailsComponent.pdfjsControl !== this.thumbnailDragService.getTargetControl()) {
        // change container
        this.thumbnailDragService.restoreSource();
        this.onDragOverNewContainer(event, containerOver);
      } else {
        // change position
        this.onDragOverSameContainer(event, containerOver);
      }
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
   * Drag in the same container
   */
  onDragOverSameContainer(event: DragEvent, containerOver: HTMLElement) {
    const thumbnailOver: HTMLElement = this.getThumbnailOver(event.toElement);
    const containerComponent: PdfjsThumbnailsComponent = this.thumbnailDragService.getComponentAcceptDrop(containerOver);
    if (thumbnailOver) { // over an other thumbnail
      const currentPosition = this.thumbnailDragService.getIndexOfItemTarget();
      const idx: number = this.thumbnailDragService.getIndexOfThumbnailInThumbnails(thumbnailOver, containerOver);
      if (currentPosition !== idx) { // not over the same
        let newPos: number = idx + this.getPositionFix(event, containerComponent.layout, thumbnailOver);
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

  onDragOverNewContainer(event: DragEvent, containerOver: HTMLElement) {
    const thumbnailOver: HTMLElement = this.getThumbnailOver(event.toElement);
    const pdfjsThumbnailsComponent: PdfjsThumbnailsComponent = this.thumbnailDragService.getComponentAcceptDrop(containerOver);
    this.thumbnailDragService.applyItemToTargetPdfControl(pdfjsThumbnailsComponent.pdfjsControl);
    if (thumbnailOver) { // over an other thumbnail
      const idx: number = this.thumbnailDragService.getIndexOfThumbnailInThumbnails(thumbnailOver, containerOver);
      let newPos: number = idx + this.getPositionFix(event, pdfjsThumbnailsComponent.layout, thumbnailOver);
      this.thumbnailDragService.addItemToTarget(newPos);
    } else {
      this.thumbnailDragService.addItemToTarget();
    }
  }

  /**
   * Compute if the thumbnail have to insert
   */
  getPositionFix($event: MouseEvent, layout: ThumbnailLayout, thumbnail: HTMLElement) {
    let position = 0;
    let overAt: 'right' | 'left' | 'bottom' | 'top';
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
    this.debugThumbnailOver(thumbnail, overAt);
    return position;
  }

  /**
   * Add css class for debug the moving of thumbnail over an other
   */
  private debugThumbnailOver(thumbnail: HTMLElement, overAt: 'right' | 'left' | 'bottom' | 'top') {
    if (PdfjsCommonComponent.DEBUG_OVER) {
      thumbnail.classList.remove('hover-right');
      thumbnail.classList.remove('hover-left');
      thumbnail.classList.remove('hover-bottom');
      thumbnail.classList.remove('hover-top');
      thumbnail.classList.add(`hover-${overAt}`);
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
  @HostListener('document:drop', ['$event'])
  onDropInDocument(event: DragEvent) {
    this.thumbnailDragService.stopMoving();
  }
}
