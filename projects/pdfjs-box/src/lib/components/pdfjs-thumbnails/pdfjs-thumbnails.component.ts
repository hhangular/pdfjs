import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PdfjsItem, ThumbnailDragMode, ThumbnailLayout} from '../../classes/pdfjs-objects';
import {PdfjsControl} from '../../classes/pdfjs-control';
import {Subject, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {ThumbnailDragService} from '../../services/thumbnail-drag.service';
import {PdfjsGroupControl} from '../../classes/pdfjs-group-control';

@Component({
  selector: 'pdfjs-thumbnails',
  templateUrl: './pdfjs-thumbnails.component.html',
  styleUrls: ['./pdfjs-thumbnails.component.css']
})
export class PdfjsThumbnailsComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('previewThumbnail')
  private previewThumbnailRef: ElementRef;

  private subSelectedItem: Subscription;
  private subItems: Subscription;
  private _pdfjsControl: PdfjsControl;
  _pdfjsGroupControl: PdfjsGroupControl;
  private items: PdfjsItem[];
  private itemsRendered: PdfjsItem[];
  private itemToPreview$: Subject<PdfjsItem & DOMRect> = new Subject();
  itemToPreview: PdfjsItem & DOMRect;

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
  layout: ThumbnailLayout = ThumbnailLayout.HORIZONTAL;

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
  }

  /**
   * Define the pdfjsControl for this thumbnail container
   */
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
      this.itemToPreview$.next(null);
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
    this.itemToPreview$.next(null);
    this.pdfjsControl.removeItem(item);
  }

  ngOnInit() {
    this.thumbnailDragService.registerDropThumbnails(this);
    if (this.previewDelay) {
      this.itemToPreview$.pipe(
        debounceTime(this.previewDelay)
      ).subscribe((item: PdfjsItem & DOMRect & { atLeft: boolean, atTop: boolean }) => {
        this.itemToPreview = item;
        if (!!item) {
          const caretSize = 10;
          const previewThumbnail: HTMLElement = this.previewThumbnailRef.nativeElement;
          this.resetPreviewThumbnail(previewThumbnail);
          if (this.layout === ThumbnailLayout.HORIZONTAL) {
            this.addVerticalCaret(previewThumbnail, item, caretSize);
          } else {
            this.addHorizontalCaret(previewThumbnail, item, caretSize);
          }
        }
      });
    }
  }

  private resetPreviewThumbnail(previewThumbnail: HTMLElement) {
    previewThumbnail.classList.remove('right-top', 'left-top',
      'right-bottom', 'left-bottom',
      'top-left', 'top-right',
      'bottom-left', 'bottom-right');
    previewThumbnail.style.right = undefined;
    previewThumbnail.style.left = undefined;
    previewThumbnail.style.bottom = undefined;
    previewThumbnail.style.top = undefined;
    previewThumbnail.style.paddingBottom = '0px';
    previewThumbnail.style.paddingTop = '0px';
    previewThumbnail.style.paddingLeft = '0px';
    previewThumbnail.style.paddingRight = '0px';
  }

  private addVerticalCaret(previewThumbnail: HTMLElement, item: PdfjsItem & DOMRect & { atLeft: boolean, atTop: boolean }, caretSize) {
    const rect: DOMRect = (item as DOMRect);
    const ratio = rect.width / rect.height;
    let cls = '';
    if (item.atTop) {
      cls = 'top';
      previewThumbnail.style.top = `${rect.y - this.previewHeight - caretSize}px`;
//      previewThumbnail.style.paddingBottom = `${caretSize}px`;
    } else {
      cls = 'bottom';
      previewThumbnail.style.top = `${rect.y + rect.height}px`;
      previewThumbnail.style.paddingTop = `${caretSize}px`;
    }
    if (item.atLeft) {
      cls += '-left';
      previewThumbnail.style.left = `${rect.x + rect.width - (this.previewHeight * ratio)}px`;
    } else {
      cls += '-right';
      previewThumbnail.style.left = `${rect.x}px`;
    }
    previewThumbnail.style.height = `${this.previewHeight + caretSize}px`;
    previewThumbnail.classList.add(cls);
  }

  private addHorizontalCaret(previewThumbnail: HTMLElement, item: PdfjsItem & DOMRect & { atLeft: boolean, atTop: boolean }, caretSize) {
    const rect: DOMRect = (item as DOMRect);
    const ratio = rect.width / rect.height;
    let cls = '';
    if (item.atLeft) {
      cls = 'left';
      previewThumbnail.style.left = `${rect.x - ((this.previewHeight * ratio) + caretSize)}px`;
      previewThumbnail.style.paddingRight = `${caretSize}px`;
    } else {
      cls = 'right';
      previewThumbnail.style.left = `${rect.x + rect.width}px`;
      previewThumbnail.style.paddingLeft = `${caretSize}px`;
    }
    if (item.atTop) {
      cls += '-top';
      previewThumbnail.style.top = `${rect.y + rect.height - this.previewHeight}px`;
    } else {
      cls += '-bottom';
      previewThumbnail.style.top = `${rect.y}px`;
    }
    previewThumbnail.style.height = `${this.previewHeight}px`;
    previewThumbnail.classList.add(cls);
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

  ngAfterViewInit() {
    const thumbnails: HTMLElement = this.elementRef.nativeElement as HTMLElement;
    if (this.layout === ThumbnailLayout.HORIZONTAL) {
      thumbnails.classList.add('horizontal');
      thumbnails.style.height = `${this.fitSize}px`;
    } else {
      thumbnails.classList.add('vertical');
      thumbnails.style.width = `${this.fitSize}px`;
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

  showPreview(item: PdfjsItem & DOMRect) {
    this.itemToPreview$.next(item);
  }

  /**
   * scrolling
   */
  @HostListener('scroll', ['$event'])
  onScroll(event: Event) {
    this.itemToPreview$.next(null);
  }

}
