import {AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {PdfjsItem, ThumbnailDragMode, ThumbnailLayout} from '../../classes/pdfjs-objects';
import {ThumbnailDragService} from '../../services';
import {PdfjsControl} from '../../classes/pdfjs-control';

@Component({
  selector: 'pdfjs-thumbnails',
  templateUrl: './pdfjs-thumbnails.component.html',
  styleUrls: ['./pdfjs-thumbnails.component.css']
})
export class PdfjsThumbnailsComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(
    public elementRef: ElementRef,
    private thumbnailDragService: ThumbnailDragService
  ) {
  }

  @Output()
  select: EventEmitter<PdfjsControl> = new EventEmitter<PdfjsControl>();

  @Input()
  selected = true;

  @Input()
  quality: 1 | 2 | 3 | 4 | 5 = 1;

  @Input()
  allowRemove = false;

  @Input()
  allowDrop = false;

  @Input()
  fitSize = 100;

  @Input()
  layout: ThumbnailLayout = ThumbnailLayout.HORIZONTAL;

  @Input()
  dragMode: ThumbnailDragMode = ThumbnailDragMode.DUPLICATE;

  @Input()
  pdfjsControl: PdfjsControl;

  /**
   * Start process of drag thumbnail
   */
  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent) {
    if (this.dragMode !== ThumbnailDragMode.NONE) {
      const thumbnail: HTMLElement = this.thumbnailDragService.getFirstParentElementNamed(event.srcElement as HTMLElement, 'pdfjs-thumbnail');
      const thumbnails: HTMLElement = this.elementRef.nativeElement as HTMLElement;
      const idx: number = this.thumbnailDragService.getIndexOfThumbnailInThumbnails(thumbnail, thumbnails);
      if (!isNaN(idx)) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/html', '<div></div>');
        this.thumbnailDragService.initDataTransfer(this.pdfjsControl.getItemByIndex(idx), this.pdfjsControl, this.dragMode);
      }
    }
  }

  removeThumbnail(item: PdfjsItem) {
    this.pdfjsControl.removeItem(item);
  }

  ngOnInit() {
    this.thumbnailDragService.registerDropThumbnails(this);
  }

  ngOnDestroy() {
    this.thumbnailDragService.unregisterDropThumbnails(this);
  }

  selection(item: PdfjsItem) {
    this.pdfjsControl.selectItemIndex(this.pdfjsControl.indexOfItem(item));
    this.select.emit(this.pdfjsControl);
  }

  ngAfterViewInit() {
    if (this.layout === ThumbnailLayout.HORIZONTAL) {
      (this.elementRef.nativeElement as HTMLElement).classList.add('horizontal');
      (this.elementRef.nativeElement as HTMLElement).style.height = this.fitSize + 'px';
    } else {
      (this.elementRef.nativeElement as HTMLElement).classList.add('vertical');
      (this.elementRef.nativeElement as HTMLElement).style.width = this.fitSize + 'px';
    }
  }
}
