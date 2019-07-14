import {PDFPageProxy, PDFPageViewport, PDFPromise, PDFRenderTask} from 'pdfjs-dist';
import {PDFDataRangeTransport} from './pdfapi';
import {PdfjsItem} from './pdfjs-item';

export class PdfjsItemEvent {
  public item: PdfjsItem;
  public event: 'init' | 'add' | 'remove' | 'move' | 'endInit';
  public from?: number;
  public to?: number;
}

export class RenderObjects {
  pdfRenderTask: PDFRenderTask;
  viewport: PDFPageViewport;
  pdfPageProxy: PDFPageProxy;
}

export class RenderEvent {
  public type: 'END' = 'END';
  public page?: number;
  public pages?: number;
  public time?: number;
}

export enum ThumbnailLayout {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export enum ViewFit {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export enum ThumbnailDragMode {
  NONE = 'none',
  MOVE = 'move',
  DUPLICATE = 'duplicate',
}

export type ThumbnailOver = ThumbnailOverValues.RIGHT | ThumbnailOverValues.LEFT | ThumbnailOverValues.BOTTOM | ThumbnailOverValues.TOP;
export enum ThumbnailOverValues {
  RIGHT = 'right',
  LEFT = 'left',
  BOTTOM = 'bottom',
  TOP = 'top'
}

export type RenderQuality = 1 | 2 | 3 | 4 | 5;

export type PdfSource = string | PDFDataRangeTransport | Uint8Array |
  { data: Uint8Array } | { range: PDFDataRangeTransport } | { url: string };

export class PdfjsConfig {
  constructor(public workerSrc: string) {
  }
}

export type InnerItem = PdfjsItem & DOMRect & { atLeft: boolean, atTop: boolean };

export class PDFPromiseResolved<T> implements PDFPromise<T> {
  public constructor(private res: T) {
  }

  public isResolved: () => true;

  public isRejected: () => false;

  public resolve: (value: T) => void;

  public reject: (reason: string) => void;

  public then<U>(onResolve: (promise: T) => U, onReject?: (reason: string) => void): PDFPromiseResolved<U> {
    return new PDFPromiseResolved(onResolve(this.res));
  }
}
