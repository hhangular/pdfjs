import {Component, HostListener} from '@angular/core';
import {ThumbnailDragMode, ThumbnailLayout, ThumbnailOver, ThumbnailOverValues} from '../classes/pdfjs-objects';
import {KeysService} from '../services/keys.service';
import {ThumbnailDragService} from '../services/thumbnail-drag.service';
import {PdfjsThumbnailsComponent} from './pdfjs-thumbnails/pdfjs-thumbnails.component';

@Component({
  selector: 'pdfjs-common',
  template: ``,
})
export class PdfjsCommonComponent {
  private static DEBUG_OVER = false;

  constructor(
    private thumbnailDragService: ThumbnailDragService,
    private keysService: KeysService,
  ) {}

  @HostListener('document:click', [])
  public onClickInDocument() {
    this.keysService.clearPdfjsControl();
  }

  @HostListener('document:keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent) {
    event.preventDefault();
    switch (event.code) {
      case 'ArrowLeft' :
        event.ctrlKey ? this.keysService.selectFirst() : this.keysService.selectPrevious();
        break;
      case 'ArrowUp' :
        event.ctrlKey ? this.keysService.selectFirst() : this.keysService.selectPrevious();
        break;
      case 'ArrowRight' :
        event.ctrlKey ? this.keysService.selectLast() : this.keysService.selectNext();
        break;
      case 'ArrowDown' :
        event.ctrlKey ? this.keysService.selectLast() : this.keysService.selectNext();
        break;
    }
  }

  @HostListener('document:scroll', [])
  public onScroll() {
    console.log('scroll');
  }

  /**
   * On drag in the document
   */
  @HostListener('document:dragover', ['$event'])
  @HostListener('document:dragenter', ['$event'])
  public onDragOverInDocument(event: DragEvent) {
    if (event.preventDefault) {
      event.preventDefault(); // Necessary. Allows us to drop.
    }
    // considerate only item drag
    if (this.thumbnailDragService.dataTransferInitiated()) {
      const containerOver: HTMLElement = this.getThumbnailsContainerOver(event.target);
      const thumbnailsComponent: PdfjsThumbnailsComponent = this.thumbnailDragService.getComponentAcceptDrop(containerOver);
      // over a thumbnails container and it accepts drop items
      if (!!thumbnailsComponent) {
        this.onDragOverContainer(event, containerOver);
      } else {
        this.onDragOutContainer(event);
      }
    }
  }

  /**
   * Drop thumbnail in any element
   */
  @HostListener('document:drop', ['$event'])
  public onDropInDocument(event: DragEvent) {
    this.thumbnailDragService.stopMoving();
  }

  /**
   * Drag item in container
   */
  private onDragOverContainer(event: DragEvent, containerOver: HTMLElement) {
    // item is anywhere yet
    if (!this.thumbnailDragService.getTargetPdfId()) {
      this.onDragOverNewContainer(event, containerOver);
    } else {
      const thumbnailsComponent: PdfjsThumbnailsComponent = this.thumbnailDragService.getComponentAcceptDrop(containerOver);
      if (thumbnailsComponent.pdfjsControl !== this.thumbnailDragService.getTargetControl()) {
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
  private onDragOutContainer(event: DragEvent) {
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
  private onDragOverSameContainer(event: DragEvent, containerOver: HTMLElement) {
    const thumbnailOver: HTMLElement = this.getThumbnailOver(event.target);
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

  private onDragOverNewContainer(event: DragEvent, containerOver: HTMLElement) {
    const thumbnailOver: HTMLElement = this.getThumbnailOver(event.target);
    const thumbnailsComponent: PdfjsThumbnailsComponent = this.thumbnailDragService.getComponentAcceptDrop(containerOver);
    this.thumbnailDragService.applyItemToTargetPdfControl(thumbnailsComponent.pdfjsControl);
    if (this.thumbnailDragService.getModeDataTransfer() === ThumbnailDragMode.MOVE) {
      this.thumbnailDragService.removeItemFromSource();
    }
    if (thumbnailOver) { // over an other thumbnail
      const idx: number = this.thumbnailDragService.getIndexOfThumbnailInThumbnails(thumbnailOver, containerOver);
      const newPos: number = idx + this.getPositionFix(event, thumbnailsComponent.layout, thumbnailOver);
      this.thumbnailDragService.addItemToTarget(newPos);
    } else {
      this.thumbnailDragService.addItemToTarget();
    }
  }

  /**
   * Compute if the thumbnail have to insert
   */
  private getPositionFix($event: MouseEvent, layout: ThumbnailLayout, thumbnail: HTMLElement) {
    let position = 0;
    let overAt: ThumbnailOver;
    const rectList: DOMRectList = thumbnail.getClientRects() as DOMRectList;
    const r: DOMRect = rectList[0];
    if (layout === ThumbnailLayout.HORIZONTAL) {
      if ($event.clientX > (r.left + r.width / 2)) { // right
        overAt = ThumbnailOverValues.RIGHT;
        position = 1;
      } else {
        overAt = ThumbnailOverValues.LEFT;
      }
    } else {
      if ($event.clientY > (r.top + r.height / 2)) { // bottom
        overAt = ThumbnailOverValues.BOTTOM;
        position = 1;
      } else {
        overAt = ThumbnailOverValues.TOP;
      }
    }
    this.debugThumbnailOver(thumbnail, overAt);
    return position;
  }

  /**
   * Add css class for debug the moving of thumbnail over an other
   */
  private debugThumbnailOver(thumbnail: HTMLElement, overAt: ThumbnailOver) {
    if (PdfjsCommonComponent.DEBUG_OVER) {
      this.removeDebugBorder(thumbnail.previousElementSibling);
      // tslint:disable-next-line:no-unused-expression
      thumbnail.previousElementSibling && this.removeDebugBorder(thumbnail.previousElementSibling.previousElementSibling);
      this.removeDebugBorder(thumbnail);
      this.removeDebugBorder(thumbnail.nextElementSibling);
      // tslint:disable-next-line:no-unused-expression
      thumbnail.nextElementSibling && this.removeDebugBorder(thumbnail.nextElementSibling.nextElementSibling);
      thumbnail.classList.add(`hover-${overAt}`);
    }
  }

  private removeDebugBorder(thumbnail: Element) {
    // tslint:disable-next-line:no-unused-expression
    thumbnail && thumbnail.classList.remove(...Object.values(ThumbnailOverValues).map(value => `hover-${value}`));
  }

  /**
   * get thumbnails element mouseover
   */
  private getThumbnailsContainerOver(eventTarget: EventTarget): HTMLElement {
    return this.thumbnailDragService.getFirstParentThumbnails(eventTarget as HTMLElement);
  }

  /**
   * get thumbnail element mouseover
   */
  private getThumbnailOver(eventTarget: EventTarget): HTMLElement {
    return this.thumbnailDragService.getFirstParentThumbnail(eventTarget as HTMLElement);
  }
}
