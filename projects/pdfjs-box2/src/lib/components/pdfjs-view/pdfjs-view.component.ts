import {Component, ElementRef, HostListener, Input, OnDestroy, ViewChild} from '@angular/core';
import {PdfjsItem, ViewFit} from '../../classes/pdfjs-objects';
import {PDFPageProxy, PDFPageViewport, PDFRenderTask} from 'pdfjs-dist';
import {Pdfjs} from '../../services';
import {PdfjsControl} from '../../classes/pdfjs-control';
import {combineLatest, Subscription} from 'rxjs';
import {KeysService} from '../../services/keys.service';

@Component({
  selector: 'pdfjs-view',
  templateUrl: './pdfjs-view.component.html',
  styleUrls: ['./pdfjs-view.component.css']
})
export class PdfjsViewComponent implements OnDestroy {

  private subscription: Subscription;
  private _pdfjsControl: PdfjsControl;

  constructor(private elementRef: ElementRef, private pdfjs: Pdfjs, private keysService: KeysService) {
  }

  @ViewChild('pdfViewer')
  pdfViewerRef: ElementRef;

  @ViewChild('textLayer')
  textLayerRef: ElementRef;

  @ViewChild('canvasWrapper')
  canvasWrapperRef: ElementRef;

  @ViewChild('page')
  pageRef: ElementRef;

  pdfRenderTask: PDFRenderTask;

  @Input()
  set pdfjsControl(pdfjsControl: PdfjsControl) {
    this._pdfjsControl = pdfjsControl;
    this.cancelRenderTask();
    if (!!this.subscription) {
      this.subscription.unsubscribe();
    }
    this.keysService.clearPdfjsControl();
    if (pdfjsControl) {
      this.subscription = combineLatest(pdfjsControl.selectedItem$, pdfjsControl.scale$, pdfjsControl.rotate$).subscribe((res: any[]) => {
        this.cancelRenderTask();
        const item: PdfjsItem = res[0] as PdfjsItem;
        const scale: number = res[1] as number;
        this.clearTextLayer();
        this.defineSize();
        const wrapper: HTMLCanvasElement = this.canvasWrapperRef.nativeElement;
        let canvas: HTMLCanvasElement;
        if (wrapper.children.length) {
          canvas = <HTMLCanvasElement>wrapper.children.item(0);
          this.pdfjs.destroyCanvas(canvas);
        }
        canvas = wrapper.appendChild(document.createElement('canvas'));
        this.pdfjs.renderItemInCanvasHeightFitted(item, this.quality, canvas, this.size * scale).then((obj: any) => {
          this.defineSizes(canvas, this.quality);
          this.pdfRenderTask = obj.pdfRenderTask as PDFRenderTask;
          if (this.textLayer) {
            this.pdfRenderTask.then(() => {
              const pdfPageViewport: PDFPageViewport = this.getViewport(obj.pdfPageProxy, obj.scale * scale / this.quality, item.rotate);
              this.pdfjs.renderTextInTextLayer(obj.pdfPageProxy, this.textLayerRef.nativeElement, pdfPageViewport);
            });
          }
        });
      });
    }
  }

  @Input()
  quality: 1 | 2 | 3 | 4 | 5 = 2;

  @Input()
  textLayer = false;

  @Input()
  fit: ViewFit = ViewFit.VERTICAL;

  size: number;

  getViewport(pdfPageProxy: PDFPageProxy, scale, rotate): PDFPageViewport {
    if (pdfPageProxy) {
      const rot = pdfPageProxy.rotate + (rotate || 0);
      return pdfPageProxy.getViewport(scale || 1, rot);
    }
    return {
      width: 0, height: 0, fontScale: 0, transforms: [], clone: null,
      convertToPdfPoint: null, convertToViewportPoint: null, convertToViewportRectangle: null
    };
  }

  /**
   * Reset text layout
   */
  clearTextLayer() {
    this.textLayerRef.nativeElement.innerHTML = '';
  }

  defineSize() {
    const view: HTMLElement = this.elementRef.nativeElement;
    const clientRect: ClientRect = view.getBoundingClientRect();
    if (this.fit === ViewFit.HORIZONTAL) {
      this.size = clientRect.width - 6;
    } else {
      this.size = clientRect.height - 6;
    }
  }

  defineSizes(canvas: HTMLCanvasElement, quality: number) {
    this.textLayerRef.nativeElement.style.height = (canvas.height / quality) + 'px';
    this.canvasWrapperRef.nativeElement.style.height = (canvas.height / quality) + 'px';
    this.pageRef.nativeElement.style.height = (canvas.height / quality) + 'px';

    this.textLayerRef.nativeElement.style.width = (canvas.width / quality) + 'px';
    this.canvasWrapperRef.nativeElement.style.width = (canvas.width / quality) + 'px';
    this.pageRef.nativeElement.style.width = (canvas.width / quality) + 'px';
  }

//  @HostBinding('style.height')
//  styleHeight: string;

  /**
   * mousewheel
   */
  @HostListener('mousewheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    if (this._pdfjsControl) {
      if (event.deltaY > 0) { // next page
        this._pdfjsControl.selectNext();
      } else {
        this._pdfjsControl.selectPrevious();
      }
    }
  }

  /**
   * set focus
   */
  @HostListener('click', ['$event'])
  onFocus(event: MouseEvent) {
    if (this._pdfjsControl) {
      event.stopPropagation();
      this.keysService.setPdfjsControl(this._pdfjsControl);
    }
  }

  @HostListener('resize', ['$event'])
  onResize(evt) {
    console.log(evt);
  }

  ngOnDestroy() {
    this.cancelRenderTask();
    const wrapper: HTMLCanvasElement = this.canvasWrapperRef.nativeElement;
    let canvas: HTMLCanvasElement;
    if (wrapper.children.length) {
      canvas = <HTMLCanvasElement>wrapper.children.item(0);
      this.pdfjs.destroyCanvas(canvas);
    }
  }

  private cancelRenderTask() {
    if (!!this.pdfRenderTask && this.pdfRenderTask.cancel) {
      this.pdfRenderTask.cancel();
    }
  }

  hasPageSelected(): boolean {
    return !!this._pdfjsControl ? !isNaN(this._pdfjsControl.getPageIndex()) : false;
  }
}
