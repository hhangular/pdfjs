import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {PdfjsItem, ThumbnailLayout} from '../../classes/pdfjs-objects';
import {PDFPromise, PDFRenderTask} from 'pdfjs-dist';
import {BehaviorSubject, combineLatest, of} from 'rxjs';
import {distinctUntilChanged, flatMap, map} from 'rxjs/operators';
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

  @HostBinding('attr.draggable')
  @Input()
  draggable = false;

  @HostBinding('class.not_rendered')
  notRendered = true;

  @Input()
  layout: ThumbnailLayout = ThumbnailLayout.HORIZONTAL;

  @Input()
  removable = false;

  @Input()
  fitSize = 100;

  @Input()
  quality: 1 | 2 | 3 | 4 | 5 = 2;

  private item$: BehaviorSubject<PdfjsItem> = new BehaviorSubject<PdfjsItem>(null);

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

  mouseOver($event: MouseEvent) {
    if (this.previewEnabled) {
      const thumbnail: HTMLElement = this.elementRef.nativeElement;
      const rectList: DOMRectList = thumbnail.getClientRects() as DOMRectList;
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
      this.showPreview.emit(Object.assign(this.item, rect));
    }
  }

  @HostListener('mouseout', ['$event'])
  mouseOut($event: MouseEvent) {
    this.showPreview.emit(null);
  }

  constructor(private elementRef: ElementRef, private pdfjs: Pdfjs) {
  }

  onClick(event: MouseEvent) {
    this.showPreview.emit(null);
    this.selectItem.emit(this.item);
  }

  ngOnInit() {
    this.item$.pipe(
      flatMap((item: PdfjsItem) => {
        return combineLatest(this.item$, item ? item.rotate$ : of(0));
      }),
      map((next: [PdfjsItem, number]) => {
        return {item: next[0], rotation: next[1]};
      }),
      distinctUntilChanged((x: { item: PdfjsItem, rotation: number },
                            y: { item: PdfjsItem, rotation: number }) => {
        return !this.isItemToRenderChanged(x, y);
      })
    ).subscribe((next: { item: PdfjsItem, rotation: number }) => {
      this.renderPdfjsItem(next.item);
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
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    if (!!pdfjsItem) {
      this.notRendered = true;
      // fixed size used for fit
      const canvasSize = this.fitSize - 10;

      let promise: PDFPromise<PDFPromise<any>>;
      if (this.layout === ThumbnailLayout.VERTICAL) {
        promise = this.pdfjs.renderItemInCanvasWidthFitted(pdfjsItem, this.quality, canvas, canvasSize);
      } else {
        promise = this.pdfjs.renderItemInCanvasHeightFitted(pdfjsItem, this.quality, canvas, canvasSize);
      }
      promise.then((obj: any) => {
        this.notRendered = false;
        this.rendered.emit(pdfjsItem);
        this.pdfRenderTask = obj.pdfRenderTask as PDFRenderTask;
      });
    } else {
      this.pdfjs.cleanCanvas(canvas);
    }
  }

  ngOnDestroy() {
    this.notRendered = false;
    this.cancelRenderTask();
    this.pdfjs.destroyCanvas(this.canvasRef.nativeElement);
  }

  private cancelRenderTask() {
    if (!!this.pdfRenderTask && this.pdfRenderTask.cancel) {
      this.pdfRenderTask.cancel();
    }
  }

}
