import {BehaviorSubject} from 'rxjs';
import {PDFDocumentProxy, PDFPageProxy, PDFPromise} from 'pdfjs-dist';
import {PdfSource} from './pdfjs-objects';

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
    public document: PdfSource,
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

export class PdfPage {
  constructor(
    public pdfId: string,
    public document: PdfSource,
    public pageIdx: number,
    public rotate: number = 0
  ) {}
}
