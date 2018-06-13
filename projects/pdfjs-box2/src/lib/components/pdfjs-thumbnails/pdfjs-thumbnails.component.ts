import {AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {PdfjsItem, ThumbnailDragMode, ThumbnailLayout} from '../../classes/pdfjs-objects';
import {ThumbnailDragService} from '../../services';
import {PdfjsControl} from '../../classes/pdfjs-control';
import {Subscription} from 'rxjs';

@Component({
  selector: 'pdfjs-thumbnails',
  templateUrl: './pdfjs-thumbnails.component.html',
  styleUrls: ['./pdfjs-thumbnails.component.css']
})
export class PdfjsThumbnailsComponent implements OnInit, OnDestroy, AfterViewInit {

  private subSelectedItem: Subscription;
  private subItems: Subscription;
  private _pdfjsControl: PdfjsControl;
  private items: PdfjsItem[];
  private itemsRendered: PdfjsItem[];

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
  set pdfjsControl(pdfjsControl: PdfjsControl) {
    this.itemsRendered = [];
    this.items = [];
    if (this.subSelectedItem) {
      this.subSelectedItem.unsubscribe();
    }
    if (this.subItems) {
      this.subItems.unsubscribe();
    }
    this._pdfjsControl = pdfjsControl;
    if (pdfjsControl) {
      this.subSelectedItem = pdfjsControl.selectedIndex$.subscribe((index: number) => {
        this.ensurePdfjsItemIsVisible(index);
      });
      this.subItems = pdfjsControl.items$.subscribe((items: PdfjsItem[]) => {
        this.items = items;
        this.itemsRendered.push(items[0]);
      });
    }
  }

  get pdfjsControl(): PdfjsControl {
    return this._pdfjsControl;
  }

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
    const thumbnails: HTMLElement = this.elementRef.nativeElement as HTMLElement;
    if (this.layout === ThumbnailLayout.HORIZONTAL) {
      thumbnails.classList.add('horizontal');
      thumbnails.style.height = this.fitSize + 'px';
    } else {
      thumbnails.classList.add('vertical');
      thumbnails.style.width = this.fitSize + 'px';
    }
  }

  private ensurePdfjsItemIsVisible(index: number) {
    const thumbnails: HTMLElement = this.elementRef.nativeElement as HTMLElement;
    if (!isNaN(index) && thumbnails.children.length > index) {
      const elt: Element = thumbnails.children.item(index);
      if (elt) {
        elt.scrollIntoView();
      }
    }
  }

  nextThumbnail($event: PdfjsItem) {
    if (this.itemsRendered.length < this.items.length) {
      this.itemsRendered.push(this.items[this.itemsRendered.length]);
    }
  }
}
