import {animate, state, style, transition, trigger} from '@angular/animations';
import {Component, ComponentRef, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {PDFPromise, PDFRenderTask} from 'pdfjs-dist';
import {BehaviorSubject, combineLatest, of, Subscription} from 'rxjs';
import {distinctUntilChanged, flatMap, map} from 'rxjs/operators';
import {PdfjsControl} from '../../classes/pdfjs-control';
import {PdfjsGroupControl} from '../../classes/pdfjs-group-control';
import {PdfjsItem, PdfjsItemEvent, ThumbnailLayout} from '../../classes/pdfjs-objects';
import {Pdfjs} from '../../services/pdfjs.service';

@Component({
  selector: 'pdfjs-thumbnail',
  templateUrl: './pdfjs-thumbnail.component.html',
  styleUrls: ['./pdfjs-thumbnail.component.css'],
  animations: [
    trigger('thumbnailState', [
      state('removed', style({
        transform: 'scale(0)',
      })),
      state('active', style({
        backgroundColor: '#337ab7',
      })),
      transition('* => removed', animate('300ms ease-out')),
    ]),
  ],

})
export class PdfjsThumbnailComponent implements OnInit, OnDestroy {

  get item(): PdfjsItem {
    return this._item;
  }

  @Input()
  set item(item: PdfjsItem) {
    this.item$.next(item);
    this._item = item;
  }

  /**
   * Define the pdfjsGroupControl for thumbnail containers
   */
  @Input()
  set pdfjsGroupControl(pdfjsGroupControl: PdfjsGroupControl) {
    if (!!this.subOnPdfjsGroupControl) {
      this.subOnPdfjsGroupControl.unsubscribe();
    }
    if (!!pdfjsGroupControl) {
      this.subOnPdfjsGroupControl = pdfjsGroupControl.selectedPdfjsControl$.pipe(
        map((ctrl: PdfjsControl) => {
          return !!ctrl && ctrl === this._pdfjsControl;
        }),
      ).subscribe((containerIsSelected: boolean) => {
        this.containerIsSelected$.next(containerIsSelected);
      });
    }
  }

  /**
   * Define the pdfjsControl for this thumbnail container
   */
  @Input()
  set pdfjsControl(pdfjsControl: PdfjsControl) {
    this._pdfjsControl = pdfjsControl;
    if (!!this.subOnPdfjsControl) {
      this.subOnPdfjsControl.unsubscribe();
    }
    if (!!pdfjsControl) {
      this.subOnPdfjsControl = pdfjsControl.selectedItem$.pipe(
        map((item: PdfjsItem) => {
          return !!item && item === this.item;
        }),
      ).subscribe((itemIsSelected: boolean) => {
        this.itemIsSelected$.next(itemIsSelected);
      });
    }
  }

  @HostBinding('@thumbnailState')
  public state;
  /**
   * The Thumbnail is rendered
   */
  @Output()
  public rendered: EventEmitter<PdfjsItem> = new EventEmitter<PdfjsItem>();
  /**
   * The Thumbnail has been over
   */
  @Output()
  public showPreview: EventEmitter<PdfjsItem & DOMRect> = new EventEmitter<PdfjsItem & DOMRect>();
  /**
   * The button remove has been clicked
   */
  @Output()
  public removeButtonClick: EventEmitter<PdfjsItem> = new EventEmitter<PdfjsItem>();
  /**
   * Select Item
   */
  @Output()
  public selectItem: EventEmitter<PdfjsItem> = new EventEmitter<PdfjsItem>();
  /**
   *
   */
  @Input()
  public previewEnabled = false;
  @HostBinding('attr.draggable')
  @Input()
  public draggable = false;
  @Input()
  public layout: ThumbnailLayout = ThumbnailLayout.HORIZONTAL;
  @Input()
  public removable = false;
  @Input()
  public fitSize = 100;
  @Input()
  public quality: 1 | 2 | 3 | 4 | 5 = 2;
  @HostBinding('class.not_rendered')
   public notRendered = true;
  @ViewChild('canvas', {static: true})
  private canvasRef: ElementRef;
  private item$: BehaviorSubject<PdfjsItem> = new BehaviorSubject<PdfjsItem>(null);
  private pdfRenderTask: PDFRenderTask;
  private _pdfjsControl: PdfjsControl;
  private subOnPdfjsControl: Subscription;
  private itemIsSelected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private subOnPdfjsGroupControl: Subscription;
  private containerIsSelected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  private _item: PdfjsItem;

  constructor(
    private elementRef: ElementRef,
    private pdfjs: Pdfjs) {
  }

  @HostListener('@thumbnailState.done', ['$event.toState'])
  public removeAnimationDone(toState: string) {
    if (toState === 'removed') {
      const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
      this.cancelRenderTask();
      this.pdfjs.cleanCanvas(canvas);
      this.removeButtonClick.emit(this._item);
    }
  }

  public mouseOver($event: MouseEvent) {
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
      // fix the problem with the collapsible scrollbar, the rect don't include scrollbar size
      const width = this.layout === ThumbnailLayout.VERTICAL ? this.fitSize : r.width;
      const height = this.layout === ThumbnailLayout.HORIZONTAL ? this.fitSize : r.height;
      const rect = {
        bottom: r.bottom, height, left: r.left, right: r.right,
        top: r.top, width, x: left, y: top,
        atLeft, atTop,
        toJSON: () => DOMRectReadOnly.prototype.toJSON.apply(this),
      };
      this.showPreview.emit(Object.assign(this.item, rect));
    }
  }

  @HostListener('mouseout', ['$event'])
  public mouseOut($event: MouseEvent) {
    this.showPreview.emit(null);
    const thumbnail: HTMLElement = this.elementRef.nativeElement;
    thumbnail.classList.remove('hover-right');
    thumbnail.classList.remove('hover-left');
    thumbnail.classList.remove('hover-bottom');
    thumbnail.classList.remove('hover-top');
  }

  public onClick(event: MouseEvent) {
    this.showPreview.emit(null);
    this.selectItem.emit(this.item);
  }

  public removeIt($event) {
    this.state = 'removed';
  }

  public ngOnInit() {
    this.item$.pipe(
      flatMap((item: PdfjsItem) => {
        return combineLatest([this.item$, item ? item.rotate$ : of(0)]);
      }),
      map((next: [PdfjsItem, number]) => {
        return {item: next[0], rotation: next[1]};
      }),
      distinctUntilChanged((x: { item: PdfjsItem, rotation: number }, y: { item: PdfjsItem, rotation: number }) => {
        return !this.isItemToRenderChanged(x, y);
      }),
    ).subscribe((next: { item: PdfjsItem, rotation: number }) => {
      this.renderPdfjsItem(next.item);
    });
    /**
     * Observe selection
     */
    combineLatest([this.containerIsSelected$, this.itemIsSelected$]).subscribe((next: boolean[]) => {
      this.elementRef.nativeElement.classList.remove('active');
      if (next.every((val: boolean) => val)) {
        this.elementRef.nativeElement.classList.add('active');
        this.elementRef.nativeElement.scrollIntoView();
      }
    });
  }

  public ngOnDestroy() {
    if (this.subOnPdfjsControl) {
      this.subOnPdfjsControl.unsubscribe();
    }
    if (this.subOnPdfjsGroupControl) {
      this.subOnPdfjsGroupControl.unsubscribe();
    }
    this.notRendered = false;
    this.cancelRenderTask();
    this.pdfjs.destroyCanvas(this.canvasRef.nativeElement);
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

  private cancelRenderTask() {
    if (!!this.pdfRenderTask && this.pdfRenderTask.cancel) {
      this.pdfRenderTask.cancel();
    }
  }
}
