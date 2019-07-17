import {animate, state, style, transition, trigger} from '@angular/animations';
import {Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {PDFRenderTask} from 'pdfjs-dist';
import {BehaviorSubject, combineLatest, of, Subscription} from 'rxjs';
import {distinctUntilChanged, flatMap, map} from 'rxjs/operators';
import {PdfjsControl} from '../../classes/pdfjs-control';
import {PdfjsGroupControl} from '../../classes/pdfjs-group-control';
import {RenderQuality, ThumbnailLayout, ViewFit} from '../../classes/pdfjs-objects';
import {PdfjsItem} from '../../classes/pdfjs-item';
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
  private _layout: ThumbnailLayout = ThumbnailLayout.HORIZONTAL;
  private _borderWidth = 5;
  private _quality: RenderQuality = 1;
  private _fitSize = 100;

  @Input()
  public previewEnabled = false;
  @HostBinding('attr.draggable')
  @Input()
  public draggable = false;
  @Input()
  public removable = false;
  @Input()
  get borderWidth(): number {
    return this._borderWidth;
  }
  set borderWidth(value: number) {
    if (this._borderWidth !== value) {
      this._borderWidth = value;
      const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
      canvas.style.padding = `${value}px`;
      if (this._item) {
        this.renderPdfjsItem(this._item);
      }
    }
  }

  @Input()
  get layout(): ThumbnailLayout {
    return this._layout;
  }
  set layout(value: ThumbnailLayout) {
    if (this._layout !== value) {
      this._layout = value;
      if (this._item) {
        this.renderPdfjsItem(this._item);
      }
    }
  }

  @Input()
  get fitSize(): number {
    return this._fitSize;
  }
  set fitSize(value: number) {
    if (this._fitSize !== value) {
      this._fitSize = value;
      if (this._item) {
        this.renderPdfjsItem(this._item);
      }
    }
  }

  @Input()
  get quality(): RenderQuality {
    return this._quality;
  }
  set quality(value: RenderQuality) {
    if (this._quality !== value) {
      this._quality = value;
      if (this._item) {
        this.renderPdfjsItem(this._item);
      }
    }
  }


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
  removeAnimationDone(toState: string) {
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
      const width = this._layout === ThumbnailLayout.VERTICAL ? this._fitSize : r.width;
      const height = this._layout === ThumbnailLayout.HORIZONTAL ? this._fitSize : r.height;
      const rect = {
        bottom: r.bottom, height, left: r.left, right: r.right,
        top: r.top, width, x: left, y: top,
        atLeft, atTop,
        toJSON: () => DOMRectReadOnly.prototype.toJSON.apply(this),
      };
      this.showPreview.emit(Object.assign(this.item, rect));
    }
  }

  @HostListener('mouseout', [])
  mouseOut() {
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
        return combineLatest([this.item$, item ? item.rotation$ : of(0)]);
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
        if (this.inViewPort(this.elementRef.nativeElement.parentElement)) { // if pdfjs-thumbnails is intoView the selection impose to scroll to view it
          if (!!this.elementRef.nativeElement.scrollIntoViewIfNeeded) {
            this.elementRef.nativeElement.scrollIntoViewIfNeeded();
          } else if (!this.inViewPort(this.elementRef.nativeElement)) {
            this.elementRef.nativeElement.scrollIntoView();
          }
        }
      }
    });
  }

  private inViewPort(nativeElement: any): boolean {
    const rect = nativeElement.getBoundingClientRect();
    const inViewPort = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
    return inViewPort;
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
      // fixed size used for fitSelected
      const canvasSize = this._fitSize - this._borderWidth * 2;
      const fit: ViewFit = this._layout === ThumbnailLayout.HORIZONTAL ? ViewFit.VERTICAL : ViewFit.HORIZONTAL;
      this.pdfjs.getRenderFittedInCanvas(fit).call(this.pdfjs, pdfjsItem, canvas, canvasSize, this._quality)
        .then((pdfRenderTask: PDFRenderTask) => {
          this.notRendered = false;
          this.rendered.emit(pdfjsItem);
          this.pdfRenderTask = pdfRenderTask;
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
