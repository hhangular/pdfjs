import {BehaviorSubject} from 'rxjs';
import {PDFDocumentProxy, PDFPageProxy, PDFPromise} from 'pdfjs-dist';
import {PdfSource} from './pdfjs-objects';

export class PdfjsItem {

  set rotation(rotate: number) {
    this._rotation = (rotate % 360);
    this.rotation$.next(this._rotation);
  }

  get rotation(): number {
    return this._rotation;
  }
  public rotation$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _rotation: number;

  constructor(
    private documentProxy: PDFDocumentProxy,
    public pdfId: string,
    public document: PdfSource,
    public pageIdx: number,
    rotation: number = 0,
  ) {
    this._rotation = rotation;
  }

  public getPage(): PDFPromise<PDFPageProxy> {
    return this.documentProxy.getPage(this.pageIdx);
  }

  public clone() {
    return new PdfjsItem(this.documentProxy, this.pdfId, this.document, this.pageIdx, this._rotation);
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
    public rotation: number = 0
  ) {}
}
