import {Component, ElementRef, HostListener} from '@angular/core';
import {PdfjsItem, ThumbnailDragMode, ThumbnailLayout} from '../classes/pdfjs-objects';
import {ThumbnailDragService} from '../services/thumbnail-drag.service';
import {PdfjsThumbnailsComponent} from './index';
import {Pdfjs} from '../services/pdfjs.service';
import {PdfAPI} from '../classes/pdfapi';

@Component({
  selector: 'pdfjs-common',
  template: ``
})
export class PdfjsCommonComponent {
  API: PdfAPI;

  constructor(
    private pdfjs: Pdfjs,
    private elementRef: ElementRef,
    private thumbnailDragService: ThumbnailDragService
  ) {
    this.API = pdfjs.getApi();
  }

  @HostListener('document:dragover', ['$event'])
  @HostListener('document:dragenter', ['$event'])
  onDragOverInDocument(event: DragEvent) {
    if (event.preventDefault) {
      event.preventDefault(); // Necessary. Allows us to drop.
    }
    event.dataTransfer.dropEffect = 'move';
    if (this.thumbnailDragService.dataTransferInitiated()) {
      const thumbnailsOver: HTMLElement = this.getThumbnailContainerOver(event.target);
      const pdfjsThumbnailsComponent: PdfjsThumbnailsComponent = this.thumbnailDragService.getComponentAcceptDrop(thumbnailsOver);
      if (!this.thumbnailDragService.getTargetPdfId()) { // not yet copy in the other thumbnails
        this.notYetCopyInThumbnails(pdfjsThumbnailsComponent, thumbnailsOver, event);
      } else { // already initiated
        this.alreadyCopyInThumbnails(pdfjsThumbnailsComponent, thumbnailsOver, event);
      }
    }
  }

  /**
   * Target not yet initiated
   */
  private notYetCopyInThumbnails(pdfjsThumbnailsComponent: PdfjsThumbnailsComponent, thumbnailsOver: HTMLElement, event: DragEvent) {
    const item: PdfjsItem = this.thumbnailDragService.getSourceItem();
    if (pdfjsThumbnailsComponent) { // over drop thumbnailsOver
      this.thumbnailDragService.applyItemToTargetPdfControl(item, pdfjsThumbnailsComponent.pdfjsControl);
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

  private alreadyCopyInThumbnails(pdfjsThumbnailsComponent: PdfjsThumbnailsComponent, thumbnailsOver: HTMLElement, event: DragEvent) {
    if (pdfjsThumbnailsComponent) { // in drop thumbnailsOver
      this.adjustTargetContainer(pdfjsThumbnailsComponent);
      const thumbnailOver: HTMLElement = this.getThumbnailOver(event.toElement);
      const currentIdx = this.thumbnailDragService.getIndexOfItemTarget();
      if (thumbnailOver) { // over other thumbnail
        const newIdx: number = this.thumbnailDragService.getIndexOfThumbnailInThumbnails(thumbnailOver, thumbnailsOver);
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
    if (pdfjsThumbnailsComponent.pdfjsControl.pdfId !== this.thumbnailDragService.getTargetPdfId()) { // not same of previous
      const item: PdfjsItem = this.thumbnailDragService.getTargetItem();
      if (this.thumbnailDragService.getTargetPdfId() !== this.thumbnailDragService.getSourcePdfId() || this.thumbnailDragService.getModeDataTransfer() === ThumbnailDragMode.MOVE) {
        this.thumbnailDragService.removeItemFromTarget();
      }
      this.thumbnailDragService.applyItemToTargetPdfControl(item, pdfjsThumbnailsComponent.pdfjsControl);
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
    if (this.thumbnailDragService.dataTransferInitiated()) { // dataTransfer exist
      const thumbnails: HTMLElement = this.getThumbnailContainerOver(event.target);
      const pdfjsThumbnailsComponent: PdfjsThumbnailsComponent = this.thumbnailDragService.getComponentAcceptDrop(thumbnails);
      this.alreadyCopyInThumbnails(pdfjsThumbnailsComponent, thumbnails, event);
      this.thumbnailDragService.stopMoving();
    }
  }

  @HostListener('document:mouseout', ['$event'])
  ouDocumentMouseOut(event: MouseEvent) {
    if (this.thumbnailDragService.dataTransferInitiated()) { // dataTransfer exist
      this.thumbnailDragService.removeItemFromTarget();
    }
  }
}
