import {PDFDocumentProxy, PDFPageProxy, PDFPageViewport, PDFPromise, PDFRenderTask} from 'pdfjs-dist';
import {BehaviorSubject} from 'rxjs';
import {PDFDataRangeTransport} from './pdfapi';

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

export class PdfjsItem {

  set rotate(rotate: number) {
    this._rotate = (rotate % 360);
    this.rotate$.next(this._rotate);
  }

  get rotate(): number {
    return this._rotate;
  }
  public rotate$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _rotate: number;

  constructor(
    private documentProxy: PDFDocumentProxy,
    public pdfId: string,
    public document: any,
    public pageIdx: number,
    rotate: number = 0,
  ) {
    this._rotate = rotate;
  }

  public getPage(): PDFPromise<PDFPageProxy> {
    return this.documentProxy.getPage(this.pageIdx);
  }

  public clone() {
    return new PdfjsItem(this.documentProxy, this.pdfId, this.document, this.pageIdx, this._rotate);
  }
  public equals(other: PdfjsItem) {
    return this.pdfId === other.pdfId && this.pageIdx === other.pageIdx;
  }
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
