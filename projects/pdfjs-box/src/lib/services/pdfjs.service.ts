import {Injectable} from '@angular/core';
import {PDFPageProxy, PDFPageViewport, PDFPromise, PDFRenderTask} from 'pdfjs-dist';
import * as api from 'pdfjs-dist/build/pdf';
import {PdfAPI, RenderingCancelledException, RenderParameters, TextLayerRenderTask} from '../classes/pdfapi';
import {RenderObjects, RenderQuality, ViewFit} from '../classes/pdfjs-objects';
import {PdfjsItem} from '../classes/pdfjs-item';

type GetScaleForFit = (size: number, viewport: PDFPageViewport) => number;

@Injectable()
export class Pdfjs {
  public API: PdfAPI;

  constructor() {
    this.API = api as PdfAPI;
  }

  public getApi(): PdfAPI {
    return this.API;
  }

  /**
   * Render page in canvas
   */
  public renderItemInCanvasVerticalFitted(item: PdfjsItem, canvas: HTMLCanvasElement, height: number, quality: RenderQuality = 1, scale: number = 1): PDFPromise<RenderObjects> {
    return this.renderItemInCanvasFitted(item, canvas, height, quality, scale, this.getScaleForVerticalFit);
  }

  /**
   * Render page in canvas
   */
  public renderItemInCanvasHorizontalFitted(item: PdfjsItem, canvas: HTMLCanvasElement, width: number, quality: RenderQuality = 1, scale: number = 1): PDFPromise<RenderObjects> {
    return this.renderItemInCanvasFitted(item, canvas, width, quality, scale, this.getScaleForHorizontalFit);
  }

  public getRenderFittedInCanvas(fit: ViewFit): (item: PdfjsItem, canvas: HTMLCanvasElement, size: number, quality?: RenderQuality, scale?: number) => PDFPromise<RenderObjects> {
    return (fit === ViewFit.VERTICAL) ? this.renderItemInCanvasVerticalFitted : this.renderItemInCanvasHorizontalFitted;
  }

  /**
   * Compute scale for vertical fitSelected thumbnail container
   */
  public getScaleForVerticalFit(height: number, viewport: PDFPageViewport): number {
    return height / viewport.height;
  }

  /**
   * Compute scale for horizontal fitSelected thumbnail container
   */
  public getScaleForHorizontalFit(width: number, viewport: PDFPageViewport): number {
    return width / viewport.width;
  }

  /**
   * Define sizes of canvas
   */
  public setCanvasSizes(canvas: HTMLCanvasElement, viewport: PDFPageViewport, quality: RenderQuality, zoom: number) {
    canvas.width = viewport.width * quality;
    canvas.height = viewport.height * quality;
    canvas.setAttribute('width', `${canvas.width}px`);
    canvas.setAttribute('height', `${canvas.height}px`);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
  }

  /**
   * Clean canvas, return ctx after
   */
  public cleanCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width || 0, canvas.height || 0);
    return ctx;
  }

  /**
   * Destroy canvas, clean and remove
   */
  public destroyCanvas(canvas: HTMLCanvasElement) {
    this.cleanCanvas(canvas);
    canvas.remove();
  }

  /**
   * Render page in canvas
   */
  protected renderItemInCanvasFitted(item: PdfjsItem, canvas: HTMLCanvasElement,
                                     size: number /*height or width*/, quality: RenderQuality, zoom: number,
                                     getScaleForFit: GetScaleForFit): PDFPromise<RenderObjects> {
    const canvasContext: CanvasRenderingContext2D = this.cleanCanvas(canvas);
    return item.getPage().then((pdfPageProxy: PDFPageProxy) => {
      // @ts-ignore
      let viewport: PDFPageViewport = pdfPageProxy.getViewport({scale: 1, rotation: item.rotation, dontFlip: false});
      const scaleForFit = getScaleForFit(size, viewport); // method.call is useless here, cause getScale has no scope
      viewport = this.factorViewport(viewport, zoom * scaleForFit); // pdfPageProxy.getViewport(zoomSelected * scaleForFit, item.rotation);
      this.setCanvasSizes(canvas, viewport, quality, zoom);
      const pdfRenderTask: PDFRenderTask = pdfPageProxy.render({
        canvasContext,
        viewport: this.factorViewport(viewport, quality) // pdfPageProxy.getViewport(scaleForFit * quality * zoomSelected, item.rotation)
      });
      pdfRenderTask.promise.then(() => {
      }, (error: any) => {
        if (error.name !== 'RenderingCancelledException') {
          console.log('render error', error);
        }
      });
      return {pdfRenderTask, viewport, pdfPageProxy};
    });
  }

  private factorViewport(viewPort: PDFPageViewport, factor: number): PDFPageViewport {
    const src: any = viewPort as any;
    if (factor === 1) {
      return viewPort;
    }
    return {
      height: src.height * factor, // 1000.0000000000001
      offsetX: src.offsetX * factor, // 0
      offsetY: src.offsetY * factor, // 0
      rotation: src.rotation, // 0
      scale: src.scale * factor, // 1.1877612510565732
      transform: src.transform.map((val: number) => val * factor), // [1.1877612510565732, 0, 0, -1.1877612510565732, 0, 1000.0000000000001],
      viewBox: src.viewBox,
      width: src.width * factor // 707.098039856611
    } as any as PDFPageViewport;
  }

  public renderTextLayer(renderParameters: RenderParameters): TextLayerRenderTask {
    return this.getApi().renderTextLayer(renderParameters);
  }

}
