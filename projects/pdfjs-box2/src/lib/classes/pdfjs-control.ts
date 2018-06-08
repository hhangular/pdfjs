import {PdfjsItem, PdfSource} from './pdfjs-objects';
import {PdfAPI} from './pdfapi';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import * as api from 'pdfjs-dist/build/pdf';
import {PDFDocumentProxy, PDFPromise} from 'pdfjs-dist';

export class PdfjsControl {
  static API: PdfAPI = api as PdfAPI;
  private source: PdfSource;
  private items: PdfjsItem[] = [];
  private rotationAngle = 0;
  private autoSelect = false;
  private itemIndex = NaN; // item selected index
  private scale = 1;
  private rotateSubscription: Subscription;

  readonly pdfId: string;

  constructor() {
    this.pdfId = uuid();
    this.subscribe();
  }

  items$: Subject<PdfjsItem[]> = new Subject();
  selectedItem$: BehaviorSubject<PdfjsItem> = new BehaviorSubject<PdfjsItem>(null);
  scale$: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  rotate$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  getItemByIndex(idx: number) {
    return this.items[idx];
  }

  getItemsLength(): number {
    return this.items.length;
  }

  containsItem(item: PdfjsItem): boolean {
    return this.items.some((it: PdfjsItem) => {
      return this.pdfId === item.pdfId && it.pageIdx === item.pageIdx;
    });
  }

  indexOfItem(item: PdfjsItem): number {
    return this.items.findIndex((it: PdfjsItem) => {
      return this.pdfId === item.pdfId && it.pageIdx === item.pageIdx;
    });
  }

  addItem(item: PdfjsItem, idx?: number) {
    if (idx === undefined) {
      this.items.push(item.clone(this.pdfId));
    } else {
      const clone: PdfjsItem = item.clone(this.pdfId);
      const old: number = this.indexOfItem(clone);
      if (old !== -1) {
        this.items.splice(old, 1);
        if (old < idx) {
          idx--;
        }
      }
      this.items.splice(idx, 0, item.clone(this.pdfId));
    }
    this.items$.next(this.items);
  }

  removeItem(item: PdfjsItem): PdfjsItem {
    const idx: number = this.indexOfItem(item);
    let removed: PdfjsItem = null;
    if (idx !== -1) {
      removed = this.items.splice(idx, 1)[0];
      removed.pdfId = null;
      this.items$.next(this.items);
    }
    return removed;
  }

  load(source: PdfSource, autoSelect = false) {
    this.source = source;
    this.autoSelect = autoSelect;
    const angle: number = this.rotationAngle || 0;
    const items: PdfjsItem[] = [];
    items.splice(0, items.length);
    const t0: number = new Date().getTime();
    return this.buildItems(source, items, angle).then((numPages: number) => {
      console.log(`Load ${numPages} pages in ${new Date().getTime() - t0}ms`);
      return numPages;
    });
  }

  private isValidList() {
    return !!this.items;
  }

  private isValidIndex() {
    return !isNaN(this.itemIndex);
  }

  selectItemIndex(index: number) {
    if (this.isValidList() && index >= 0 && index < this.items.length) {
      this.itemIndex = index;
      const item: PdfjsItem = this.items[this.itemIndex];
      this.selectedItem$.next(item);
      if (this.rotateSubscription) {
        this.rotateSubscription.unsubscribe();
      }
      this.rotateSubscription = item.rotate$.subscribe((angle: number) => {
        this.rotate$.next(angle);
      });
    }
  }

  selectFirst() {
    if (this.isValidList()) {
      this.selectItemIndex(0);
    }
  }

  selectLast() {
    if (this.isValidList()) {
      this.selectItemIndex(this.items.length);
    }
  }

  hasNext() {
    return this.isValidList() && this.isValidIndex() && this.itemIndex + 1 < this.items.length;
  }

  hasPrevious() {
    return this.isValidList() && this.isValidIndex() && this.itemIndex > 0;
  }

  selectNext() {
    if (this.hasNext()) {
      this.selectItemIndex(this.itemIndex + 1);
    }
  }

  selectPrevious() {
    if (this.hasPrevious()) {
      this.selectItemIndex(isNaN(this.itemIndex) ? NaN : this.itemIndex - 1);
    }
  }

  rotate(angle: number) {
    this.rotationAngle += angle;
    this.items.forEach((item: PdfjsItem) => {
      item.rotate += angle;
    });
  }

  rotateSelected(angle: number) {
    if (!!this.items.length) {
      this.items[this.itemIndex].rotate += angle;
    }
  }

  zoom(zoom: number) {
    this.scale$.next(this.scale * zoom);
  }

  reload() {
    this.load(this.source);
  }

  private subscribe() {
    this.items$.subscribe((items: PdfjsItem[]) => {
      this.items = items;
      if (this.autoSelect) {
        this.selectFirst();
      }
    });
    this.scale$.subscribe((scale: number) => {
      this.scale = scale;
    });
  }

  isSelected(item: PdfjsItem): boolean {
    return item && !isNaN(this.itemIndex) && this.items[this.itemIndex] && item.pdfId === this.pdfId && item.pageIdx === this.items[this.itemIndex].pageIdx;
  }

  /**
   * build items
   */
  buildItems(source: PdfSource, items: PdfjsItem[], angle: number): PDFPromise<number> {
    const pdfId: string = this.pdfId;
    return PdfjsControl.API.getDocument(source).then((pdfDocumentProxy: PDFDocumentProxy) => {
      [].push.apply(items, Array.apply(null, {length: pdfDocumentProxy.numPages}).map(function (e, i) {
        return new PdfjsItem(pdfDocumentProxy, pdfId, source, i + 1, angle);
      }, Number));
      this.items$.next(items);
      return pdfDocumentProxy.numPages;
    }, (reason: string) => {
      this.items$.error(reason);
    });
  }
}

/**
 * Generate uuid
 */
function uuid(): string {
  const buf: Uint32Array = new Uint32Array(4);
  getCryptoObj().getRandomValues(buf);
  let idx = -1;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
    idx++;
    const r = (buf[idx >> 3] >> ((idx % 8) * 4)) & 15;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * return RandomSource implementation
 */
function getCryptoObj(): RandomSource {
  return window.crypto || window['msCrypto'] as RandomSource || {
    getRandomValues: function (buf) {
      for (let i = 0, l = buf.length; i < l; i++) {
        buf[i] = Math.floor(Math.random() * 256);
      }
      return buf;
    }
  };
}

