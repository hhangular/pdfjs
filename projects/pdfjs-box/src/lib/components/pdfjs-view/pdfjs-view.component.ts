import {AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, ViewChild} from '@angular/core';
import {PDFPageProxy, PDFPageViewport, PDFRenderTask} from 'pdfjs-dist';
import {BehaviorSubject, combineLatest, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, flatMap, tap} from 'rxjs/operators';
import {PdfjsControl} from '../../classes/pdfjs-control';
import {PdfjsGroupControl} from '../../classes/pdfjs-group-control';
import {PdfjsItem, RenderQuality, ViewFit} from '../../classes/pdfjs-objects';
import {KeysService} from '../../services/keys.service';
import {Pdfjs} from '../../services/pdfjs.service';

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
  private _pdfjsControl: PdfjsControl;
  private observer: BehaviorSubject<[PdfjsItem, number, number]> = new BehaviorSubject<[PdfjsItem, number, number]>([null, 0, 0]);
  private canvasWidth;
  private canvasHeight;
  private width;
  private height;
  private item: PdfjsItem = null;
  private scale = 1;
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
      distinctUntilChanged((x: [PdfjsItem, number, number], y: [PdfjsItem, number, number]) => {
        return !(this.oneNull(x, y)
          || this.oneNull(x[0], y[0])
          || x[0].pdfId !== y[0].pdfId
          || x[0].pageIdx !== y[0].pageIdx
          || x[1] !== y[1] || x[2] !== y[2]);
      }),
    ).subscribe((data: [PdfjsItem, number, number]) => {
      this.updateRender(data[0], data[1]);
    });
  }

  public hasPageSelected(): boolean {
    return !!this._pdfjsControl ? !isNaN(this._pdfjsControl.getPageIndex()) : false;
  }

  private getViewport(pdfPageProxy: PDFPageProxy, scale, rotate): PDFPageViewport {
    if (pdfPageProxy) {
      const rot = pdfPageProxy.rotate + (rotate || 0);
      return pdfPageProxy.getViewport(scale || 1, rot);
    }
    return {
      width: 0, height: 0, fontScale: 0, transforms: [], clone: null,
      convertToPdfPoint: null, convertToViewportPoint: null, convertToViewportRectangle: null,
    };
  }

  /**
   * Reset text layout
   */
  private clearTextLayer() {
    this.textLayerRef.nativeElement.innerHTML = '';
  }

  private defineSize() {
    const view: HTMLElement = this.elementRef.nativeElement;
    const clientRect: ClientRect = view.getBoundingClientRect();
    this.height = clientRect.height;
    this.width = clientRect.width;
    if (this.fit === ViewFit.HORIZONTAL) {
      this.size = this.width - 6;
    } else {
      this.size = this.height - 6;
    }
  }

  private defineSizes(canvas: HTMLCanvasElement, quality: number) {
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
        return combineLatest([pdfjsControl.selectedItem$, pdfjsControl.scale$, pdfjsControl.rotate$]);
      }),
    ).subscribe((data: [PdfjsItem, number, number]) => {
      this.observer.next(data);
    });
  }

  private setPdfjsControl(pdfjsControl: PdfjsControl) {
    this._pdfjsControl = pdfjsControl;
    combineLatest([pdfjsControl.selectedItem$, pdfjsControl.scale$, pdfjsControl.rotate$]).pipe(
      filter((data: [PdfjsItem, number, number]) => {
        return !!data[0];
      }),
    ).subscribe((data: [PdfjsItem, number, number]) => {
      this.observer.next(data);
    });
  }

  private updateRender(item: PdfjsItem, scale: number) {
    this.item = item;
    this.scale = scale;
    this.updateRenderForCurrentItem();
  }
  private updateRenderForCurrentItem() {
    if (!this.item) {
      return;
    }
    this.cancelRenderTask();
    this.clearTextLayer();
    this.defineSize();
    const wrapper: HTMLCanvasElement = this.canvasWrapperRef.nativeElement;
    let canvas: HTMLCanvasElement;
    if (wrapper.children.length) {
      canvas = wrapper.children.item(0) as HTMLCanvasElement;
      this.pdfjs.destroyCanvas(canvas);
    }
    if (!!this.item) {
      canvas = wrapper.appendChild(document.createElement('canvas'));
      this.pdfjs.renderItemInCanvasHeightFitted(this.item, this.quality, canvas, this.size * this.scale).then((obj: any) => {
        this.defineSizes(canvas, this.quality);
        this.pdfRenderTask = obj.pdfRenderTask as PDFRenderTask;
        if (this.textLayer) {
          this.pdfRenderTask.promise.then(() => {
            const pdfPageViewport: PDFPageViewport = this.getViewport(obj.pdfPageProxy, obj.scale * this.scale, this.item.rotate);
            this.pdfjs.renderTextInTextLayer(obj.pdfPageProxy, this.textLayerRef.nativeElement, pdfPageViewport);
          });
        }
      });
    }
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
