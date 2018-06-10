import {Injectable} from '@angular/core';
import {PdfAPI, RenderingCancelledException} from '../classes/pdfapi';
import * as api from 'pdfjs-dist/build/pdf';
import {PDFPageProxy, PDFPageViewport, PDFPromise, PDFRenderTask, TextContent} from 'pdfjs-dist';
import {PdfjsItem} from '../classes/pdfjs-objects';

type Fitter = (canvas: HTMLCanvasElement, size: number, rect: DOMRect, quality: number) => number;

@Injectable()
export class Pdfjs {
  API: PdfAPI;

  constructor() {
    this.API = api as PdfAPI;
  }

  getApi(): PdfAPI {
    return this.API;
  }

  /**
   * Render page in canvas
   */
  renderItemInCanvasHeightFitted(item: PdfjsItem, quality: 1 | 2 | 3 | 4 | 5,
                                 canvas: HTMLCanvasElement, height: number): PDFPromise<any> {
    return this.renderItemInCanvasFitted(item, quality, canvas, height,
      (c: HTMLCanvasElement, size: number, rect: DOMRect, q: number) => this.horizontalFitter(c, size, rect, q));
  }

  /**
   * Render page in canvas
   */
  renderItemInCanvasWidthFitted(item: PdfjsItem, quality: 1 | 2 | 3 | 4 | 5,
                                canvas: HTMLCanvasElement, width: number): PDFPromise<any> {
    return this.renderItemInCanvasFitted(item, quality, canvas, width,
      (c: HTMLCanvasElement, size: number, rect: DOMRect, q: number) => this.verticalFitter(c, size, rect, q));
  }

  /**
   * Render text layout in textLayer
   */
  renderTextInTextLayer(pdfPageProxy: PDFPageProxy, textLayer: HTMLElement, pdfPageViewport: PDFPageViewport) {
    return pdfPageProxy.getTextContent().then((textContent: TextContent) => {
      this.API.renderTextLayer({
        textContent: textContent,
        container: textLayer,
        viewport: pdfPageViewport,
        textDivs: []
      });
    });
  }

  /**
   * fitter for vertical thumbnail container
   */
  verticalFitter(canvas: HTMLCanvasElement, width: number, rect: DOMRect, quality: number): number {
    const scale = width / rect.width;
    const ratio: number = rect.height / rect.width;
    this.setCanvasSize(canvas, width, width * ratio, quality);
    return scale;
  }

  /**
   * fitter for horizontal thumbnail container
   */
  horizontalFitter(canvas: HTMLCanvasElement, height: number, rect: DOMRect, quality: number): number {
    const scale = height / rect.height;
    const ratio: number = rect.width / rect.height;
    this.setCanvasSize(canvas, height * ratio, height, quality);
    return scale;
  }

  /**
   * Define sizes of canvas
   */
  setCanvasSize(canvas: HTMLCanvasElement, width: number, height: number, quality: number) {
    canvas.setAttribute('width', `${width * quality}px`);
    canvas.setAttribute('height', `${height * quality}px`);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  }

  /**
   * Render page in canvas
   */
  private renderItemInCanvasFitted(item: PdfjsItem, quality: 1 | 2 | 3 | 4 | 5,
                                   canvas: HTMLCanvasElement, size: number, fitter: Fitter): PDFPromise<any> {
    const ctx: CanvasRenderingContext2D = this.cleanCanvas(canvas);
    return !!item ? item.getPage().then((pdfPageProxy: PDFPageProxy) => {
      const r: DOMRect = this.getRectangle(pdfPageProxy, item.rotate);
      const scale = fitter(canvas, size, r, quality);
      const pdfPageViewport: PDFPageViewport = pdfPageProxy.getViewport(scale * quality, item.rotate);
      const pdfRenderTask: PDFRenderTask = pdfPageProxy.render({canvasContext: ctx, viewport: pdfPageViewport});
      pdfRenderTask.then(() => {
      }, (error: any) => {
        if (error.name !== 'RenderingCancelledException') {
          console.log('render error', error);
        }
      });
      return {pdfRenderTask: pdfRenderTask, pdfPageProxy: pdfPageProxy, pdfPageViewport: pdfPageViewport, scale: scale};
    }) : this.getResolvedPromise();
  }

  private getResolvedPromise(): PDFPromise<any> {
    const promise: any =  new Promise<any>(() => {});
    promise.isResolved = () => true;
    promise.isRejected = () => false;
    promise.resolve = (value: any) => {};
    promise.reject = (reason: string) => {};
    return promise as PDFPromise<any>;
  }

  /**
   * Clean canvas
   */
  cleanCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width || 0, canvas.height || 0);
    return ctx;
  }

  destroyCanvas(canvas: HTMLCanvasElement) {
    this.cleanCanvas(canvas);
    canvas.remove();
  }

  /**
   * Get rectangle for page, consedering rotate
   */
  getRectangle(pdfPAgeProxy: PDFPageProxy, rotate: number): DOMRect {
    let vHeight = 0;
    let vWidth = 0;
    if (pdfPAgeProxy && pdfPAgeProxy.view) {
      const view: number[] = pdfPAgeProxy.view;
      const rotation = pdfPAgeProxy.rotate + (rotate || 0);
      if ((rotation / 90) % 2) {
        vWidth = (view[3] - view[1]);
        vHeight = (view[2] - view[0]);
      } else {
        vHeight = (view[3] - view[1]);
        vWidth = (view[2] - view[0]);
      }
    }
    return new DOMRect(0, 0, vWidth, vHeight);
  }
}
