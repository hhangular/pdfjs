import {PdfjsItem, PdfjsItemEvent, PdfSource} from './pdfjs-objects';
import {PdfAPI} from './pdfapi';
import {BehaviorSubject, Subscription} from 'rxjs';
import * as api from 'pdfjs-dist/build/pdf';
import {PDFDocumentProxy, PDFPromise} from 'pdfjs-dist';
import {PdfjsCommand} from './pdfjs-command';
import {filter} from 'rxjs/operators';

export class PdfjsControl implements PdfjsCommand {
  static API: PdfAPI = api as PdfAPI;
  id: string;
  pdfId: string;
  itemEvent$: BehaviorSubject<PdfjsItemEvent> = new BehaviorSubject(null);
  selectedItem$: BehaviorSubject<PdfjsItem> = new BehaviorSubject<PdfjsItem>(null);
  selectedIndex$: BehaviorSubject<number> = new BehaviorSubject<number>(NaN);
  scale$: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  rotate$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private source: PdfSource;
  private items: PdfjsItem[] = [];
  private autoSelect = false;
  private itemIndex = NaN; // item selected index
  private rotateSubscription: Subscription;
  private addItemEvent: BehaviorSubject<PdfjsItemEvent> = new BehaviorSubject<PdfjsItemEvent>(null);
  private removeItemEvent: BehaviorSubject<PdfjsItemEvent> = new BehaviorSubject<PdfjsItemEvent>(null);

  constructor() {
    this.id = uuid();
    this.addItemEvent.pipe(
      filter((itemEvent: PdfjsItemEvent) => {
        return !!itemEvent;
      }),
    ).subscribe((itemEvent: PdfjsItemEvent) => {
      let idx = itemEvent.to;
      const clone: PdfjsItem = itemEvent.item.clone();
      let pos: number = this.indexOfItem(clone);
      if (idx === undefined) {
        if (pos !== -1 && pos !== this.items.length - 1) {
          this.items.splice(pos, 1);
          this.itemEvent$.next({item: clone, event: 'remove'});
          pos = -1;
        }
        if (pos === -1) {
          this.items.push(clone);
          this.itemEvent$.next({item: clone, event: 'add'});
        }
      } else {
        if (pos !== -1) {
          this.items.splice(pos, 1);
          this.itemEvent$.next({item: clone, event: 'remove'});
          if (pos < idx) {
            idx--;
          }
        }
        this.items.splice(idx, 0, clone);
        this.itemEvent$.next({item: clone, event: 'add', to: idx});
        // in case where item add was before current selected index
        this.fixAfterAddItem();
      }
    });
    this.removeItemEvent.pipe(
      filter((itemEvent: PdfjsItemEvent) => {
        return !!itemEvent;
      }),
    ).subscribe((itemEvent: PdfjsItemEvent) => {
      const item: PdfjsItem = itemEvent.item;
      const isSelected = this.isSelected(item);
      const idx: number = this.indexOfItem(item);
      let removed: PdfjsItem = null;
      if (idx !== -1) {
        removed = this.items.splice(idx, 1)[0];
        if (removed.pdfId !== item.pdfId || removed.pageIdx !== item.pageIdx) {
          this.items.splice(idx, 0, removed);
          removed = null;
        }
        this.itemEvent$.next({item: item, event: 'remove'});
        // in case where item removed was before current selected index or it was removed item
        this.fixAfterRemoveItem(isSelected);
      }
    });
  }

  getItems() {
    return this.items;
  }

  getItemByIndex(idx: number) {
    return this.items[idx];
  }

  getItemsLength(): number {
    return this.items.length;
  }

  getNumberOfPages(): number {
    return this.items.length;
  }

  containsItem(item: PdfjsItem): boolean {
    return this.items.some((it: PdfjsItem) => {
      return it.pdfId === item.pdfId && it.pageIdx === item.pageIdx;
    });
  }

  indexOfItem(item: PdfjsItem): number {
    return !!item ? this.indexOfItemByIds(item.pdfId, item.pageIdx) : -1;
  }

  indexOfItemByIds(pdfId: string, pageIdx: number): number {
    return this.items.findIndex((it: PdfjsItem) => {
      return it.pdfId === pdfId && it.pageIdx === pageIdx;
    });
  }

  addItem(item: PdfjsItem, idx?: number) {
    this.addItemEvent.next({item: item, event: 'add', to: idx});
  }

  removeItem(item: PdfjsItem) {
    this.removeItemEvent.next({item: item, event: 'remove'});
  }

  load(source: PdfSource, autoSelect = false) {
    this.pdfId = this.getPdfId(source);
    this.source = source;
    this.autoSelect = autoSelect;
    this.selectedItem$.next(null);
    this.selectedIndex$.next(NaN);
    this.itemIndex = NaN;
    return this.buildItems(source).then((numPages: number) => {
      return numPages;
    });
  }

  unload() {
    this.source = null;
    this.itemIndex = NaN;
    this.items = [];
  }

  unselect() {
    this.selectItemIndex(NaN);
  }

  selectItemIndex(index: number) {
    if (isNaN(index)) {
      this.selectedItem$.next(null);
      this.selectedIndex$.next(NaN);
      this.itemIndex = NaN;
      this.unsubscribeRotateSubject();
    } else if (this.isValidList() && index >= 0 && index < this.items.length) {
      this.itemIndex = index;
      const item: PdfjsItem = this.items[this.itemIndex];
      this.selectedItem$.next(item);
      this.selectedIndex$.next(index);
      this.unsubscribeRotateSubject();
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
      this.selectItemIndex(this.items.length - 1);
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
    const scale = this.scale$.getValue() * zoom;
    this.scale$.next(scale);
  }

  fit() {
    this.scale$.next(1);
  }

  reload() {
    if (!!this.pdfId) {
      const idx = this.itemIndex;
      this.selectItemIndex(NaN);
      return this.load(this.source).then((num: number) => {
        this.selectItemIndex(idx);
        return num;
      });
    }
  }

  isSelected(item: PdfjsItem): boolean {
    return item && !isNaN(this.itemIndex) && this.items[this.itemIndex] && item.pdfId === this.items[this.itemIndex].pdfId && item.pageIdx === this.items[this.itemIndex].pageIdx;
  }

  /**
   * index based 0
   */
  getItemIndex() {
    return this.itemIndex;
  }

  /**
   * index based 1
   */
  getPageIndex() {
    return isNaN(this.itemIndex) ? this.itemIndex : this.itemIndex + 1;
  }

  private fixAfterAddItem() {
    this.itemIndex = this.indexOfItem(this.selectedItem$.getValue());
    this.selectedIndex$.next(this.itemIndex);
  }

  private fixAfterRemoveItem(wasSelected: boolean) {
    if (wasSelected) {
      this.itemIndex = NaN;
      this.selectedIndex$.next(NaN);
      this.selectedItem$.next(null);
    } else {
      this.itemIndex = this.indexOfItem(this.selectedItem$.getValue());
      this.selectedIndex$.next(this.itemIndex);
    }
  }

  private getPdfId(source: any): string {
    if (typeof source === 'string') {
      return md5(source as string);
    } else if (!!source.id) {
      return source.id;
    } else if (!!source.url) {
      return md5(source.url);
    } else {
      return uuid();
    }
  }

  private isValidList() {
    return !!this.items;
  }

  private isValidIndex() {
    return !isNaN(this.itemIndex);
  }

  private unsubscribeRotateSubject() {
    if (this.rotateSubscription) {
      this.rotateSubscription.unsubscribe();
      this.rotateSubscription = null;
    }
  }

  /**
   * build items
   */
  private buildItems(source: PdfSource): PDFPromise<number> {
    if (this.items && this.items.length) {
      this.items.forEach((item: PdfjsItem) => {
        this.itemEvent$.next({item: item, event: 'remove'});
      });
    }
    this.items = [];
    this.itemEvent$.next({item: null, event: 'init'});
    return PdfjsControl.API.getDocument(source).then((pdfDocumentProxy: PDFDocumentProxy) => {
      [].push.apply(this.items, Array.apply(null, {length: pdfDocumentProxy.numPages})
        .map((e: any, i: number) => {
          const item: PdfjsItem = new PdfjsItem(pdfDocumentProxy, this.pdfId, source, i + 1, 0);
          this.itemEvent$.next({item: item, event: 'add', to: i});
          return item;
        }, Number));
      this.itemEvent$.next({item: null, event: 'endInit'});
      if (this.autoSelect) {
        this.selectFirst();
      }
      return pdfDocumentProxy.numPages;
    }, (reason: string) => {
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

/**
 * MD%
 */
function md5(stringToHash: string) {
  let AA: number, BB: number, CC: number, DD: number;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;
  stringToHash = Utf8Encode(stringToHash);
  const x = ConvertToWordArray(stringToHash);
  let a = 0x67452301;
  let b = 0xEFCDAB89;
  let c = 0x98BADCFE;
  let d = 0x10325476;
  for (let k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }
  const temp: string = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
  return temp.toLowerCase();
}

function RotateLeft(lValue: number, iShiftBits: number) {
  return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
}

function AddUnsigned(lX: number, lY: number) {
  let lX4: number, lY4: number, lX8: number, lY8: number, lResult: number;
  lX8 = (lX & 0x80000000);
  lY8 = (lY & 0x80000000);
  lX4 = (lX & 0x40000000);
  lY4 = (lY & 0x40000000);
  lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
  if (lX4 & lY4) {
    return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
  }
  if (lX4 | lY4) {
    if (lResult & 0x40000000) {
      return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
    } else {
      return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    }
  } else {
    return (lResult ^ lX8 ^ lY8);
  }
}

function F(x: number, y: number, z: number) {
  return (x & y) | ((~x) & z);
}

function G(x: number, y: number, z: number) {
  return (x & z) | (y & (~z));
}

function H(x: number, y: number, z: number) {
  return (x ^ y ^ z);
}

function I(x: number, y: number, z: number) {
  return (y ^ (x | (~z)));
}

function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
  a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
  return AddUnsigned(RotateLeft(a, s), b);
}

function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
  a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
  return AddUnsigned(RotateLeft(a, s), b);
}

function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
  a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
  return AddUnsigned(RotateLeft(a, s), b);
}

function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
  a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
  return AddUnsigned(RotateLeft(a, s), b);
}

function ConvertToWordArray(stringToHash: string) {
  let lWordCount: number;
  const lMessageLength: number = stringToHash.length;
  const lNumberOfWords_temp1: number = lMessageLength + 8;
  const lNumberOfWords_temp2: number = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
  const lNumberOfWords: number = (lNumberOfWords_temp2 + 1) * 16;
  const lWordArray = Array(lNumberOfWords - 1);
  let lBytePosition = 0;
  let lByteCount = 0;
  while (lByteCount < lMessageLength) {
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = (lWordArray[lWordCount] | (stringToHash.charCodeAt(lByteCount) << lBytePosition));
    lByteCount++;
  }
  lWordCount = (lByteCount - (lByteCount % 4)) / 4;
  lBytePosition = (lByteCount % 4) * 8;
  lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
  lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
  lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
  return lWordArray;
}

function WordToHex(lValue: number) {
  let WordToHexValue = '', WordToHexValue_temp = '';
  let lByte: number, lCount: number;
  for (lCount = 0; lCount <= 3; lCount++) {
    lByte = (lValue >>> (lCount * 8)) & 255;
    WordToHexValue_temp = `'0${lByte.toString(16)}`;
    WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
  }
  return WordToHexValue;
}

function Utf8Encode(stringToHash: string) {
  stringToHash = stringToHash.replace(/\r\n/g, '\n');
  let utfText = '';
  for (let n = 0; n < stringToHash.length; n++) {
    const c: number = stringToHash.charCodeAt(n);
    if (c < 128) {
      utfText += String.fromCharCode(c);
    } else if ((c > 127) && (c < 2048)) {
      utfText += String.fromCharCode((c >> 6) | 192);
      utfText += String.fromCharCode((c & 63) | 128);
    } else {
      utfText += String.fromCharCode((c >> 12) | 224);
      utfText += String.fromCharCode(((c >> 6) & 63) | 128);
      utfText += String.fromCharCode((c & 63) | 128);
    }
  }
  return utfText;
}
