import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {PdfjsItem, ThumbnailLayout} from '../../classes/pdfjs-objects';
import {PDFPromise, PDFRenderTask} from 'pdfjs-dist';
import {BehaviorSubject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {Pdfjs} from '../../services/pdfjs.service';

@Component({
  selector: 'pdfjs-thumbnail',
  templateUrl: './pdfjs-thumbnail.component.html',
  styleUrls: ['./pdfjs-thumbnail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfjsThumbnailComponent implements OnInit, OnDestroy {

  @ViewChild('canvas')
  private canvasRef: ElementRef;

  /**
   * The Thumbnail is rendered
   */
  @Output()
  rendered: EventEmitter<PdfjsItem> = new EventEmitter<PdfjsItem>();

  /**
   * The Thumbnail has been over
   */
  @Output()
  showPreview: EventEmitter<PdfjsItem & DOMRect> = new EventEmitter<PdfjsItem & DOMRect>();

  /**
   * The button remove has been clicked
   */
  @Output()
  removeButtonClick: EventEmitter<PdfjsItem> = new EventEmitter<PdfjsItem>();

  /**
   * Select Item
   */
  @Output()
  selectItem: EventEmitter<PdfjsItem> = new EventEmitter<PdfjsItem>();

  /**
   *
   */
  @Input()
  previewEnabled = false;

  @Input()
  draggable = false;

  @Input()
  layout: ThumbnailLayout = ThumbnailLayout.HORIZONTAL;

  @Input()
  removable = false;

  @Input()
  fitSize = 100;

  @Input()
  quality: 1 | 2 | 3 | 4 | 5 = 2;

  private rotateSubscription: Subscription;

  private item$: BehaviorSubject<PdfjsItem> = new BehaviorSubject<PdfjsItem>(null);
  private itemToRender$: BehaviorSubject<{ item: PdfjsItem, rotation: number }> = new BehaviorSubject<{ item: PdfjsItem, rotation: number }>(null);
  private itemToPreview$: BehaviorSubject<PdfjsItem & DOMRect> = new BehaviorSubject<PdfjsItem & DOMRect>(null);

  private _item: PdfjsItem;

  private pdfRenderTask: PDFRenderTask;

  @Input()
  set item(item: PdfjsItem) {
    this.item$.next(item);
    this._item = item;
  }

  get item(): PdfjsItem {
    return this._item;
  }

  @HostListener('mouseover', ['$event'])
  mouseOver($event: MouseEvent) {
    if (this.previewEnabled) {
      const rectList: DOMRectList = (this.elementRef.nativeElement as HTMLElement).getClientRects() as DOMRectList;
      const r: DOMRect = rectList[0];
      let atLeft = false;
      let atTop = false;
      const left = Math.max($event.clientX - $event.offsetX, 0);
      const top = Math.max($event.clientY - $event.offsetY, 0);
      if ((left * 2) + r.width > window.innerWidth) {
        atLeft = true;
      }
      if ((top * 2) + r.height > window.innerHeight) {
        atTop = true;
      }
      const rect = {
        bottom: r.bottom, height: r.height, left: r.left, right: r.right,
        top: r.top, width: r.width, x: left, y: top,
        atLeft: atLeft, atTop: atTop
      };
      this.itemToPreview$.next(Object.assign(this.item, rect));
    }
  }

  @HostListener('mouseout', ['$event'])
  mouseOut($event: MouseEvent) {
    this.itemToPreview$.next(null);
  }

  constructor(private elementRef: ElementRef, private pdfjs: Pdfjs) {
  }

  onClick(event: MouseEvent) {
    this.itemToPreview$.next(null);
    this.selectItem.emit(this.item);
  }

  ngOnInit() {
    this.item$.subscribe((item: PdfjsItem) => {
      if (!!this.rotateSubscription) {
        this.rotateSubscription.unsubscribe();
      }
      if (!!item) {
        this.itemToRender$.next({item: item, rotation: item.rotate});
        this.rotateSubscription = item.rotate$.subscribe((rot: number) => {
          this.itemToRender$.next({item: item, rotation: rot});
        });
      } else {
        this.itemToRender$.next({item: null, rotation: 0});
      }
    });
    this.itemToRender$.pipe(
      debounceTime(100),
      distinctUntilChanged((x: { item: PdfjsItem, rotation: number },
                            y: { item: PdfjsItem, rotation: number }) => !this.isItemToRenderChanged(x, y))
    ).subscribe((next: { item: PdfjsItem, rotation: number }) => {
      this.renderPdfjsItem(next.item);
    });
    this.itemToPreview$.pipe(
    ).subscribe((item: PdfjsItem & DOMRect) => {
      this.showPreview.emit(item);
    });
  }

  private isItemToRenderChanged(x: { item: PdfjsItem, rotation: number }, y: { item: PdfjsItem, rotation: number }) {
    return !(!x && !y) && (
      (!x && !!y) || (!!x && !y) ||
      this.isItemChanged(x.item, y.item) ||
      x.rotation !== y.rotation
    );
  }

  private isItemChanged(x: PdfjsItem, y: PdfjsItem) {
    const isChanged = !(!x && !y) && (
      (!x && !!y) || (!!x && !y) || x.pdfId !== y.pdfId || x.pageIdx !== y.pageIdx
    );
    return isChanged;
  }

  private renderPdfjsItem(pdfjsItem: PdfjsItem) {
    this.cancelRenderTask();
    const thumbnail: HTMLElement = this.elementRef.nativeElement;
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    if (!!pdfjsItem) {
      thumbnail.classList.add('not_rendered');
      // fixed size used for fit
      const canvasSize = this.fitSize - 10;

      let promise: PDFPromise<PDFPromise<any>>;
      if (this.layout === ThumbnailLayout.VERTICAL) {
        (this.elementRef.nativeElement as HTMLElement).style.width = `${this.fitSize}px`;
        promise = this.pdfjs.renderItemInCanvasWidthFitted(pdfjsItem, this.quality, canvas, canvasSize);
      } else {
        (this.elementRef.nativeElement as HTMLElement).style.height = `${this.fitSize}px`;
        promise = this.pdfjs.renderItemInCanvasHeightFitted(pdfjsItem, this.quality, canvas, canvasSize);
      }
      promise.then((obj: any) => {
        thumbnail.classList.remove('not_rendered');
        this.rendered.emit(pdfjsItem);
        this.pdfRenderTask = obj.pdfRenderTask as PDFRenderTask;
      });
    } else {
      this.pdfjs.cleanCanvas(canvas);
    }
  }

  ngOnDestroy() {
    const thumbnail: HTMLElement = this.elementRef.nativeElement;
    if (!!thumbnail) {
      thumbnail.classList.remove('not_rendered');
    }
    this.cancelRenderTask();
    this.pdfjs.destroyCanvas(this.canvasRef.nativeElement);
  }

  private cancelRenderTask() {
    if (!!this.pdfRenderTask && this.pdfRenderTask.cancel) {
      this.pdfRenderTask.cancel();
    }
  }

}
