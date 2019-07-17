import {PDFDocumentProxy, PDFPromise} from 'pdfjs-dist';
import * as api from 'pdfjs-dist/build/pdf';
import {BehaviorSubject, Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {PdfAPI} from './pdfapi';
import {PdfjsCommand} from './pdfjs-command';
import {PdfjsItemEvent, PDFPromiseResolved, PdfSource} from './pdfjs-objects';
import {PdfjsItem, PdfPage} from './pdfjs-item';
import {Crypto} from './pdfjs-crypto';

export class PdfjsControl implements PdfjsCommand {
  public static API: PdfAPI = api as PdfAPI;
  public id: string;
  public pdfId: string;
  public itemEvent$: BehaviorSubject<PdfjsItemEvent> = new BehaviorSubject(null);
  public selectedItem$: BehaviorSubject<PdfjsItem> = new BehaviorSubject<PdfjsItem>(null);
  public selectedIndex$: BehaviorSubject<number> = new BehaviorSubject<number>(NaN);
  public rotation$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private source: PdfSource;
  private items: PdfjsItem[] = [];
  private autoSelect = false;
  private itemIndex = NaN; // item selected index
  private rotationSubscription: Subscription;
  private addItemEvent: BehaviorSubject<PdfjsItemEvent> = new BehaviorSubject<PdfjsItemEvent>(null);
  private removeItemEvent: BehaviorSubject<PdfjsItemEvent> = new BehaviorSubject<PdfjsItemEvent>(null);

  constructor() {
    this.id = Crypto.uuid();
    this.subscribeToAddItem();
    this.subscribeToRemoveItem();
  }

  public getPdfPages(): PdfPage[] {
    return this.items.map(val => {
      return {document: val.document, pdfId: val.pdfId, pageIdx: val.pageIdx, rotation: val.rotation};
    });
  }

  public getItemByIndex(idx: number): PdfjsItem {
    return this.items[idx];
  }

  public getPageNumber(): number {
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

  public addItem(item: PdfjsItem, idx?: number): void {
    this.addItemEvent.next({item, event: 'add', to: idx});
  }

  public removeItem(item: PdfjsItem): void {
    this.removeItemEvent.next({item, event: 'remove'});
  }

  public load(source: PdfSource, autoSelect = false): PDFPromise<number> {
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

  public unload(): void {
    this.source = null;
    this.itemIndex = NaN;
    this.items = [];
  }

  public unselect(): number {
    return this.selectItemIndex(NaN);
  }

  public selectItemIndex(index: number): number {
    const prev: number = this.itemIndex;
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
      this.rotationSubscription = item.rotation$.subscribe((angle: number) => {
        this.rotation$.next(angle);
      });
    }
    return prev;
  }

  public selectFirst(): number {
    if (this.isValidList()) {
      return this.selectItemIndex(0);
    }
    return NaN;
  }

  public selectLast(): number {
    if (this.isValidList()) {
      return this.selectItemIndex(this.items.length - 1);
    }
    return NaN;
  }

  public nextIsSelectable(): boolean {
    return this.isValidList() && this.isValidIndex() && this.itemIndex + 1 < this.items.length;
  }

  public previousIsSelectable(): boolean {
    return this.isValidList() && this.isValidIndex() && this.itemIndex > 0;
  }

  public selectNext(): number {
    if (this.nextIsSelectable()) {
      return this.selectItemIndex(this.itemIndex + 1);
    }
    return NaN;
  }

  public selectPrevious(): number {
    if (this.previousIsSelectable()) {
      return this.selectItemIndex(isNaN(this.itemIndex) ? NaN : this.itemIndex - 1);
    }
    return NaN;
  }

  public rotate(angle: number): void {
    this.items.forEach((item: PdfjsItem) => {
      item.rotation += angle;
    });
  }

  public rotateSelected(angle: number): void {
    if (!!this.items.length) {
      this.items[this.itemIndex].rotation += angle;
    }
  }

  public reload(): PDFPromise<number> {
    const idx = this.selectItemIndex(NaN);
    if (!!this.pdfId) {
      return this.load(this.source).then((num: number) => {
        this.selectItemIndex(idx);
        return num;
      });
    }
    return new PDFPromiseResolved<number>(0);
  }

  /**
   * index based 0
   */
  public getSelectedItemIndex(): number {
    return this.itemIndex;
  }

  /**
   * index based 1
   */
  public getSelectedPageIndex(): number {
    return isNaN(this.itemIndex) ? this.itemIndex : this.itemIndex + 1;
  }

  private subscribeToAddItem() {
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
  }

  private subscribeToRemoveItem() {
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

  private indexOfItemByIds(pdfId: string, pageIdx: number): number {
    return this.items.findIndex((it: PdfjsItem) => {
      return it.pdfId === pdfId && it.pageIdx === pageIdx;
    });
  }

  private isSelected(item: PdfjsItem): boolean {
    return item && !isNaN(this.itemIndex) && this.items[this.itemIndex] && item.pdfId === this.items[this.itemIndex].pdfId && item.pageIdx === this.items[this.itemIndex].pageIdx;
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

  private getPdfId(source: PdfSource): string {
    if (typeof source === 'string') {
      return Crypto.md5(source as string);
    } else if (!!(source as any).id) {
      return (source as any).id;
    } else if (!!(source as any).url) {
      return Crypto.md5((source as any).url);
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
    if (this.rotationSubscription) {
      this.rotationSubscription.unsubscribe();
      this.rotationSubscription = null;
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
