import {AfterViewInit, Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {PdfjsItem, ThumbnailDragMode, ThumbnailLayout} from '../../classes/pdfjs-objects';
import {PdfjsControl} from '../../classes/pdfjs-control';
import {Subscription} from 'rxjs';
import {ThumbnailDragService} from '../../services/thumbnail-drag.service';
import {PdfjsGroupControl} from '../../classes/pdfjs-group-control';

@Component({
  selector: 'pdfjs-thumbnails',
  templateUrl: './pdfjs-thumbnails.component.html',
  styleUrls: ['./pdfjs-thumbnails.component.css']
})
export class PdfjsThumbnailsComponent implements OnInit, OnDestroy {

  ThumbnailDragMode = ThumbnailDragMode;

  @HostBinding('class.vertical')
  private vertical = false;

  private subSelectedItem: Subscription;
  private subSelected: Subscription;
  private subItems: Subscription;
  private _pdfjsControl: PdfjsControl;
  private _pdfjsGroupControl: PdfjsGroupControl;
  private _layout: ThumbnailLayout = ThumbnailLayout.HORIZONTAL;
  private items: PdfjsItem[];
  private itemsRendered: PdfjsItem[];
  itemToPreview: PdfjsItem & DOMRect;
  selected = false;

  constructor(
    public elementRef: ElementRef,
    private thumbnailDragService: ThumbnailDragService
  ) {
  }

  /**
   * Delay for show preview. 0 => disable preview
   */
  @Input()
  previewDelay = 0;

  /**
   * Height of preview
   */
  @Input()
  previewHeight = 300;

  /**
   * The quality of pdf render
   */
  @Input()
  quality: 1 | 2 | 3 | 4 | 5 = 1;

  /**
   * The remove button on thumbnail is it visible
   */
  @Input()
  allowRemove = false;

  /**
   * This container accept drop thumbnail
   */
  @Input()
  allowDrop = false;

  /**
   * size to fit. Depends of direction layout
   */
  @Input()
  fitSize = 100;

  /**
   * Layout direction
   */
  @Input()
  set layout(layout: ThumbnailLayout) {
    this._layout = layout;
    this.vertical = layout !== ThumbnailLayout.HORIZONTAL;
    const thumbnails: HTMLElement = this.elementRef.nativeElement as HTMLElement;
    if (this.vertical) {
      thumbnails.style.width = `${this.fitSize}px`;
    } else {
      thumbnails.style.height = `${this.fitSize}px`;
    }
  }

  get layout(): ThumbnailLayout {
    return this._layout;
  }

  /**
   * Drag mode
   */
  @Input()
  dragMode: ThumbnailDragMode = ThumbnailDragMode.DUPLICATE;

  /**
   * Define the pdfjsGroupControl for thumbnail containers
   */
  @Input()
  set pdfjsGroupControl(pdfjsGroupControl: PdfjsGroupControl) {
    this._pdfjsGroupControl = pdfjsGroupControl;
    if (this.subSelected) {
      this.subSelected.unsubscribe();
    }
    if (!!pdfjsGroupControl) {
      this.subSelected = pdfjsGroupControl.selectedPdfjsControl$.subscribe((pdfjsControl: PdfjsControl) => {
        this.selected = this.pdfjsControl === pdfjsControl;
      });
    } else {
      this.selected = false;
    }
  }

  /**
   * Define the pdfjsControl for this thumbnail container
   */
  @Input()
  set pdfjsControl(pdfjsControl: PdfjsControl) {
    this.selected = false;
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
        this.selected = true;
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
      this.itemToPreview = null;
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
    this.itemToPreview = null;
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
    if (this._pdfjsGroupControl) {
      this._pdfjsGroupControl.select(this.pdfjsControl);
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

  /**
   * scrolling
   */
  @HostListener('scroll', ['$event'])
  onScroll(event: Event) {
    this.itemToPreview = null;
  }

  @HostListener('mouseout', ['$event'])
  mouseOut($event: MouseEvent) {
    this.itemToPreview = null;
  }

}
