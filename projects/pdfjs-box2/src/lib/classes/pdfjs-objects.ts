import {PDFDocumentProxy, PDFPageProxy, PDFPromise} from 'pdfjs-dist';
import {PDFDataRangeTransport} from './pdfapi';
import {BehaviorSubject} from 'rxjs';

export class PdfjsItem {
  private _rotate: number;
  public rotate$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(
    private documentProxy: PDFDocumentProxy,
    public pdfId: string,
    public document: any,
    public pageIdx: number,
    rotate: number = 0
  ) {
    this._rotate = rotate;
  }

  set rotate(rotate: number) {
    this._rotate = (rotate % 360);
    this.rotate$.next(this._rotate);
  }

  get rotate(): number {
    return this._rotate;
  }

  getPage(): PDFPromise<PDFPageProxy> {
    return this.documentProxy.getPage(this.pageIdx);
  }

  clone() {
    return new PdfjsItem(this.documentProxy, this.pdfId, this.document, this.pageIdx, this._rotate);
  }
}

export enum ThumbnailLayout {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical'
}

export enum ViewFit {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical'
}

export enum ThumbnailDragMode {
  NONE = 'none',
  MOVE = 'move',
  DUPLICATE = 'duplicate'
}

export type PdfSource = string | PDFDataRangeTransport | Uint8Array |
  { data: Uint8Array } | { range: PDFDataRangeTransport } | { url: string };

export class PdfjsConfig {
  constructor(public workerSrc: string) {
  }
}
