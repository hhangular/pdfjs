import {PDFDocumentProxy} from 'pdfjs-dist';
import {PDFDataRangeTransport} from './pdfapi';
import {BehaviorSubject} from 'rxjs';

export class PdfjsItem {
  public _rotate: number;
  public pdfRotate: number;
  public rotate$: BehaviorSubject<number>;

  constructor(
    private documentProxy: PDFDocumentProxy,
    public pdfId: string,
    public document: any,
    public pageIdx: number,
    rotate: number,
  ) {
    this.pdfRotate = rotate;
    this._rotate = rotate;
    this.rotate$ = new BehaviorSubject<number>(rotate);
  }

  set rotate(rotate: number) {
    this._rotate = rotate % 360;
    this.rotate$.next(this._rotate);
  }
  get rotate(): number {
    return this._rotate;
  }

  public getPage(): any {
    return this.documentProxy.getPage(this.pageIdx);
  }

  public clone(pdfId: string) {
    return new PdfjsItem(this.documentProxy, pdfId, this.document, this.pageIdx, this.rotate);
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
  workerSrc: string;
}
