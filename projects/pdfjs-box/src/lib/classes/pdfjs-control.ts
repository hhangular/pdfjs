import {PDFDocumentProxy, PDFPromise} from 'pdfjs-dist';
import * as api from 'pdfjs-dist/build/pdf';
import {BehaviorSubject, Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {PdfAPI} from './pdfapi';
import {PdfjsCommand} from './pdfjs-command';
import {PdfjsItem, PdfjsItemEvent, PDFPromiseResolved, PdfSource} from './pdfjs-objects';
import {Crypto} from './pdfjs-crypto';

export class PdfjsControl implements PdfjsCommand {
  public static API: PdfAPI = api as PdfAPI;
  public id: string;
  public pdfId: string;
  public itemEvent$: BehaviorSubject<PdfjsItemEvent> = new BehaviorSubject(null);
  public selectedItem$: BehaviorSubject<PdfjsItem> = new BehaviorSubject<PdfjsItem>(null);
  public selectedIndex$: BehaviorSubject<number> = new BehaviorSubject<number>(NaN);
  public scale$: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  public rotate$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private source: PdfSource;
  private items: PdfjsItem[] = [];
  private autoSelect = false;
  private itemIndex = NaN; // item selected index
  private rotateSubscription: Subscription;
  private addItemEvent: BehaviorSubject<PdfjsItemEvent> = new BehaviorSubject<PdfjsItemEvent>(null);
  private removeItemEvent: BehaviorSubject<PdfjsItemEvent> = new BehaviorSubject<PdfjsItemEvent>(null);

  constructor() {
    this.id = Crypto.uuid();
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
        this.itemEvent$.next({item, event: 'remove'});
        // in case where item removed was before current selected index or it was removed item
        this.fixAfterRemoveItem(isSelected);
      }
    });
  }

  public getItems() {
    return this.items;
  }

  public getItemByIndex(idx: number) {
    return this.items[idx];
  }

  public getItemsLength(): number {
    return this.items.length;
  }

  public getNumberOfPages(): number {
    return this.items.length;
  }

  public containsItem(item: PdfjsItem): boolean {
    return this.items.some((it: PdfjsItem) => {
      return it.pdfId === item.pdfId && it.pageIdx === item.pageIdx;
    });
  }

  public indexOfItem(item: PdfjsItem): number {
    return !!item ? this.indexOfItemByIds(item.pdfId, item.pageIdx) : -1;
  }

  public indexOfItemByIds(pdfId: string, pageIdx: number): number {
    return this.items.findIndex((it: PdfjsItem) => {
      return it.pdfId === pdfId && it.pageIdx === pageIdx;
    });
  }

  public addItem(item: PdfjsItem, idx?: number) {
    this.addItemEvent.next({item, event: 'add', to: idx});
  }

  public removeItem(item: PdfjsItem) {
    this.removeItemEvent.next({item, event: 'remove'});
  }

  public load(source: PdfSource, autoSelect = false) {
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

  public unload() {
    this.source = null;
    this.itemIndex = NaN;
    this.items = [];
  }

  public unselect() {
    this.selectItemIndex(NaN);
  }

  public selectItemIndex(index: number) {
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

  public selectFirst() {
    if (this.isValidList()) {
      this.selectItemIndex(0);
    }
  }

  public selectLast() {
    if (this.isValidList()) {
      this.selectItemIndex(this.items.length - 1);
    }
  }

  public hasNext() {
    return this.isValidList() && this.isValidIndex() && this.itemIndex + 1 < this.items.length;
  }

  public hasPrevious() {
    return this.isValidList() && this.isValidIndex() && this.itemIndex > 0;
  }

  public selectNext() {
    if (this.hasNext()) {
      this.selectItemIndex(this.itemIndex + 1);
    }
  }

  public selectPrevious() {
    if (this.hasPrevious()) {
      this.selectItemIndex(isNaN(this.itemIndex) ? NaN : this.itemIndex - 1);
    }
  }

  public rotate(angle: number) {
    this.items.forEach((item: PdfjsItem) => {
      item.rotate += angle;
    });
  }

  public rotateSelected(angle: number) {
    if (!!this.items.length) {
      this.items[this.itemIndex].rotate += angle;
    }
  }

  public zoom(zoom: number) {
    const scale = this.scale$.getValue() * zoom;
    this.scale$.next(scale);
  }

  public fit() {
    this.scale$.next(1);
  }

  public reload(): PDFPromise<number> {
    if (!!this.pdfId) {
      const idx = this.itemIndex;
      this.selectItemIndex(NaN);
      return this.load(this.source).then((num: number) => {
        this.selectItemIndex(idx);
        return num;
      });
    } else {
      return new PDFPromiseResolved<number>(0);
    }
  }

  public isSelected(item: PdfjsItem): boolean {
    return item && !isNaN(this.itemIndex) && this.items[this.itemIndex] && item.pdfId === this.items[this.itemIndex].pdfId && item.pageIdx === this.items[this.itemIndex].pageIdx;
  }

  /**
   * index based 0
   */
  public getItemIndex() {
    return this.itemIndex;
  }

  /**
   * index based 1
   */
  public getPageIndex() {
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
      return Crypto.md5(source as string);
    } else if (!!source.id) {
      return source.id;
    } else if (!!source.url) {
      return Crypto.md5(source.url);
    } else {
      return Crypto.uuid();
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
        this.itemEvent$.next({item, event: 'remove'});
      });
    }
    this.items = [];
    this.itemEvent$.next({item: null, event: 'init'});
    return PdfjsControl.API.getDocument(source).promise.then((pdfDocumentProxy: PDFDocumentProxy) => {
      [].push.apply(this.items, Array.apply(null, {length: pdfDocumentProxy.numPages})
        .map((e: any, i: number) => {
          const item: PdfjsItem = new PdfjsItem(pdfDocumentProxy, this.pdfId, source, i + 1, 0);
          this.itemEvent$.next({item, event: 'add', to: i});
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
