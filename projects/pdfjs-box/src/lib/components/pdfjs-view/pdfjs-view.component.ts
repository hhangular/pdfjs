import {AfterViewInit, Component, ElementRef, HostListener, Inject, Input, OnDestroy, ViewChild} from '@angular/core';
import {PDFPageProxy, PDFPageViewport, PDFRenderTask, TextContent} from 'pdfjs-dist';
import {BehaviorSubject, combineLatest, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, flatMap, tap} from 'rxjs/operators';
import {PdfjsControl} from '../../classes/pdfjs-control';
import {PdfjsGroupControl} from '../../classes/pdfjs-group-control';
import {RenderQuality, ViewFit} from '../../classes/pdfjs-objects';
import {KeysService} from '../../services/keys.service';
import {Pdfjs} from '../../services/pdfjs.service';
import {DOCUMENT} from '@angular/common';
import {PdfjsItem} from '../../classes/pdfjs-item';

@Component({
  selector: 'pdfjs-view',
  templateUrl: './pdfjs-view.component.html',
  styleUrls: ['./pdfjs-view.component.css'],
})
export class PdfjsViewComponent implements OnDestroy, AfterViewInit {

  @ViewChild('textLayer', {static: true})
  private textLayerRef: ElementRef;
  @ViewChild('canvasWrapper', {static: true})
  private canvasWrapperRef: ElementRef;
  @ViewChild('page', {static: true})
  private pageRef: ElementRef;

  private pdfRenderTask: PDFRenderTask;
  private size = 100;
  private subscription: Subscription;
  private observer: BehaviorSubject<[PdfjsItem, number]> = new BehaviorSubject<[PdfjsItem, number]>([null, 0]);
  private canvasWidth: number;
  private canvasHeight: number;
  private width: number;
  private height: number;
  private item: PdfjsItem = null;
  private _pdfjsControl: PdfjsControl;
  private _scale = 1;
  private _textLayer = false;
  private _quality: RenderQuality = 2;
  private _fit: ViewFit = ViewFit.VERTICAL;

  @Input()
  mouseWheelNav = true;

  @Input()
  keysNav = true;

  /**
   * PdfjsControl ou PdfjsGroupControl
   */
  @Input()
  set control(control: PdfjsControl | PdfjsGroupControl) {
    if (!!this.subscription) {
      this.subscription.unsubscribe();
    }
    this.cancelRenderTask();
    this.keysService.clearPdfjsControl();
    if (control) {
      if (control instanceof PdfjsControl) {
        this.setPdfjsControl(control);
      } else {
        this.setPdfjsGroupControl(control);
      }
    } else {
      this._pdfjsControl = null;
    }
  }

  /**
   * Fit direction
   */
  @Input()
  set fit(fit: ViewFit) {
    if (this._fit !== fit) {
      this._fit = fit;
      this.updateRenderForCurrentItem();
    }
  }
  get fit(): ViewFit {
    return this._fit;
  }

  /**
   * Fit direction
   */
  @Input()
  set scale(scale: number) {
    if (this._scale !== scale) {
      this._scale = scale;
      this.updateRenderForCurrentItem();
    }
  }
  get scale(): number {
    return this._scale;
  }

  /**
   * Render quality
   */
  @Input()
  set quality(quality: RenderQuality) {
    if (this._quality !== quality) {
      this._quality = quality;
      this.updateRenderForCurrentItem();
    }
  }
  get quality(): RenderQuality {
    return this._quality;
  }

  /**
   * Render quality
   */
  @Input()
  set textLayer(textLayer: boolean) {
    if (this._textLayer !== textLayer) {
      this._textLayer = textLayer;
      this.updateRenderForCurrentItem();
    }
  }
  get textLayer(): boolean {
    return this._textLayer;
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
    private pdfjs: Pdfjs,
    private keysService: KeysService) {
  }

  public ngOnDestroy() {
    this.cancelRenderTask();
    const wrapper: HTMLCanvasElement = this.canvasWrapperRef.nativeElement;
    let canvas: HTMLCanvasElement;
    if (wrapper.children.length) {
      canvas = wrapper.children.item(0) as HTMLCanvasElement;
      this.pdfjs.destroyCanvas(canvas);
    }
  }

  public ngAfterViewInit(): void {
    this.observer.pipe(
      distinctUntilChanged((x: [PdfjsItem, number], y: [PdfjsItem, number]) => {
        return !(this.oneNull(x, y)
          || this.oneNull(x[0], y[0])
          || x[0].pdfId !== y[0].pdfId
          || x[0].pageIdx !== y[0].pageIdx
          || x[1] !== y[1]);
      }),
    ).subscribe((data: [PdfjsItem, number]) => {
      this.updateRender(data[0]);
    });
  }

  public hasPageSelected(): boolean {
    return !!this._pdfjsControl ? !isNaN(this._pdfjsControl.getSelectedPageIndex()) : false;
  }

  /**
   * Reset text layout
   */
  private clearTextLayer() {
    this.textLayerRef.nativeElement.innerHTML = '<div class="endOfContent"></div>';
  }

  /**
   * Compute size function of fitSelected
   */
  private computeSize() {
    const view: HTMLElement = this.elementRef.nativeElement;
    const clientRect: ClientRect = view.getBoundingClientRect();
    this.height = clientRect.height;
    this.width = clientRect.width;
    if (this.fit === ViewFit.HORIZONTAL) {
      this.size = this.width - 20;
    } else {
      this.size = this.height - 6;
    }
  }

  private defineSizesFromCanvasSizes(canvas: HTMLCanvasElement, quality: number) {
    this.canvasWidth = canvas.width / quality;
    this.canvasHeight = canvas.height / quality;
    const height = `${this.canvasHeight}px`;
    const width = `${this.canvasWidth}px`;
    this.textLayerRef.nativeElement.style.height = height;
    this.canvasWrapperRef.nativeElement.style.height = height;
    this.pageRef.nativeElement.style.height = height;

    this.textLayerRef.nativeElement.style.width = width;
    this.canvasWrapperRef.nativeElement.style.width = width;
    this.pageRef.nativeElement.style.width = width;
  }

  /**
   * mousewheel
   */
  @HostListener('mousewheel', ['$event'])
  public onMouseWheel(event: WheelEvent) {
    if (!this.mouseWheelNav) {
      return;
    }
    if (this._pdfjsControl) {
      if (this.canvasHeight <= this.height) {
        if (event.deltaY > 0) { // next page
          event.preventDefault();
          this._pdfjsControl.selectNext();
        } else if (event.deltaY < 0) {
          event.preventDefault();
          this._pdfjsControl.selectPrevious();
        }
      }
      if (this.canvasWidth <= this.width) {
        if (event.deltaX > 0) { // next page
          event.preventDefault();
          this._pdfjsControl.selectNext();
        } else if (event.deltaX < 0) {
          event.preventDefault();
          this._pdfjsControl.selectPrevious();
        }
      }
    }
  }

  /**
   * set focus
   */
  @HostListener('click', ['$event'])
  public onFocus(event: MouseEvent) {
    if (this.keysNav && this._pdfjsControl) {
      event.stopPropagation();
      this.keysService.setPdfjsControl(this._pdfjsControl);
    }
  }

  // @HostListener('window:resize', ['$event'])
  public onResize(evt) {
    console.log(evt);
  }

  private setPdfjsGroupControl(pdfjsGroupControl: PdfjsGroupControl) {
    pdfjsGroupControl.selectedPdfjsControl$.pipe(
      tap((pdfjsControl: PdfjsControl) => {
        this._pdfjsControl = pdfjsControl;
      }),
      filter((pdfjsControl: PdfjsControl) => {
        return !!pdfjsControl;
      }),
      flatMap((pdfjsControl: PdfjsControl) => {
        return combineLatest([pdfjsControl.selectedItem$, pdfjsControl.rotation$]);
      }),
    ).subscribe((data: [PdfjsItem, number]) => {
      this.observer.next(data);
    });
  }

  private setPdfjsControl(pdfjsControl: PdfjsControl) {
    this._pdfjsControl = pdfjsControl;
    combineLatest([pdfjsControl.selectedItem$, pdfjsControl.rotation$]).pipe(
      filter((data: [PdfjsItem, number]) => {
        return !!data[0];
      }),
    ).subscribe((data: [PdfjsItem, number]) => {
      this.observer.next(data);
    });
  }

  private updateRender(item: PdfjsItem) {
    this.item = item;
    this.updateRenderForCurrentItem();
  }
  private updateRenderForCurrentItem() {
    if (!this.item) {
      return;
    }
    this.cancelRenderTask();
    this.clearTextLayer();
    this.computeSize();
    const wrapper: HTMLCanvasElement = this.canvasWrapperRef.nativeElement;
    let canvas: HTMLCanvasElement;
    if (wrapper.children.length) {
      canvas = wrapper.children.item(0) as HTMLCanvasElement;
      this.pdfjs.destroyCanvas(canvas);
    }
    canvas = wrapper.appendChild(document.createElement('canvas'));
    this.pdfjs.getRenderFittedInCanvas(this.fit)
      .call(this.pdfjs, this.item, canvas, this.size, this.quality, this.scale)
      .then((obj: {pdfRenderTask: PDFRenderTask, viewport: PDFPageViewport, pdfPageProxy: PDFPageProxy}) => {
        this.defineSizesFromCanvasSizes(canvas, this.quality);
        this.pdfRenderTask = obj.pdfRenderTask;
        if (this.textLayer) {
          const container = this.document.createDocumentFragment();
          obj.pdfPageProxy.getTextContent().then((textContent: TextContent) => {
            const textLayerRenderTask = this.pdfjs.renderTextLayer({
              textContent,
              container,
              viewport: obj.viewport
            }).promise.then(() => {
              this.textLayerRef.nativeElement.insertBefore(container, this.textLayerRef.nativeElement.firstChild);
            });
            return textLayerRenderTask;
          });
        }
    });
  }

  private cancelRenderTask() {
    if (!!this.pdfRenderTask && this.pdfRenderTask.cancel) {
      this.pdfRenderTask.cancel();
    }
  }

  private bothNull(x, y) {
    return !x && !y;
  }

  private oneNull(x, y) {
    return !x || !y;
  }
}
