import {
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef, EventEmitter,
  HostBinding,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  OnInit, Output,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {PdfjsControl} from '../../classes/pdfjs-control';
import {PdfjsGroupControl} from '../../classes/pdfjs-group-control';
import {PdfjsItem} from '../../classes/pdfjs-item';
import {
  PdfjsItemEvent, RenderEvent,
  RenderQuality,
  ThumbnailDragMode,
  ThumbnailLayout
} from '../../classes/pdfjs-objects';
import {ThumbnailDragService} from '../../services/thumbnail-drag.service';
import {PdfjsThumbnailComponent} from '../pdfjs-thumbnail/pdfjs-thumbnail.component';

@Component({
  selector: 'pdfjs-thumbnails',
  templateUrl: './pdfjs-thumbnails.component.html',
  styleUrls: ['./pdfjs-thumbnails.component.css'],
})
export class PdfjsThumbnailsComponent implements OnInit, OnDestroy {

  private _quality: RenderQuality = 1;
  private _fitSize = 100;
  private _previewDelay = 100;
  private _dragMode = ThumbnailDragMode.DUPLICATE;
  private _borderWidth = 5;
  private _allowRemove = false;
  public _allowDrop = false;
  private _pdfjsControl: PdfjsControl;
  private init = false;
  private items: PdfjsItem[] = [];
  private timeStart = 0;

  @Output()
  render: EventEmitter<RenderEvent> = new EventEmitter();

  /**
   * Layout direction
   */
  @Input()
  set layout(layout: ThumbnailLayout) {
    this.vertical = layout !== ThumbnailLayout.HORIZONTAL;
    this.thumbnailComponentRefs.forEach((componentRef: ComponentRef<PdfjsThumbnailComponent>) => {
      componentRef.instance.layout = layout;
    });
    this.computeSizes();
  }
  get layout(): ThumbnailLayout {
    return this.vertical ? ThumbnailLayout.VERTICAL : ThumbnailLayout.HORIZONTAL;
  }

  /**
   * Define the pdfjsControl for this thumbnail container
   */
  @Input()
  set pdfjsControl(pdfjsControl: PdfjsControl) {
    this._pdfjsControl = pdfjsControl;
    if (pdfjsControl) {
      pdfjsControl.itemEvent$.pipe(
        filter((next: PdfjsItemEvent) => {
          return !!next;
        }),
      ).subscribe((next: PdfjsItemEvent) => {
        if (next.event === 'init') {
          this.timeStart = new Date().getTime();
          this.items = [];
          this.init = true;
        } else if (next.event === 'endInit') {
          this.init = false;
          if (this.items.length) {
            this.itemEvent$.next({event: 'add', item: this.items.shift(), to: 0});
          }
        } else {
          if (this.init) {
            this.items.push(next.item);
          } else {
            this.itemEvent$.next(next);
          }
        }
      });
    }
  }
  get pdfjsControl(): PdfjsControl {
    return this._pdfjsControl;
  }

  @ViewChild('container', {static: true, read: ViewContainerRef})
  container: ViewContainerRef;

  @ViewChild('pdfjs-preview', {static: true})
  previewRef: ElementRef;

  @HostBinding('class.vertical')
  vertical = false;
  itemEvent$: Subject<PdfjsItemEvent> = new Subject<PdfjsItemEvent>();
  thumbnailComponentRefs: Array<ComponentRef<PdfjsThumbnailComponent>> = [];
  itemToPreview: PdfjsItem & DOMRect;

  /**
   * Delay for show preview. 0 => disable preview
   */
  @Input()
  set previewDelay(delay: number) {
    if (this._previewDelay !== delay) {
      this._previewDelay = delay;
      this.thumbnailComponentRefs.forEach((componentRef: ComponentRef<PdfjsThumbnailComponent>) => {
        componentRef.instance.previewEnabled = !!delay;
      });
    }
  }
  get previewDelay(): number {
    return this._previewDelay;
  }

  /**
   * Height of preview
   */
  @Input()
  previewHeight = 300;

  /**
   * quality of preview
   */
  @Input()
  previewQuality: RenderQuality = 2;

  /**
   * The quality of pdf render
   */
  @Input()
  set quality(q: RenderQuality) {
    if (this._quality !== q) {
      this._quality = q;
      this.timeStart = new Date().getTime();
      this.thumbnailComponentRefs.forEach((componentRef: ComponentRef<PdfjsThumbnailComponent>) => {
        componentRef.instance.quality = q;
      });
    }
  }
  get quality(): RenderQuality {
    return this._quality;
  }

  /**
   * The remove button on thumbnail is it visible
   */
  @Input()
  set allowRemove(allow: boolean) {
    if (this._allowRemove !== allow) {
      this._allowRemove = allow;
      this.thumbnailComponentRefs.forEach((componentRef: ComponentRef<PdfjsThumbnailComponent>) => {
        componentRef.instance.removable = allow;
      });
    }
 }
  get allowRemove(): boolean {
    return this._allowRemove;
  }

  /**
   * This container accept drop thumbnail
   */
  @Input()
  set allowDrop(allow: boolean) {
    if (this._allowDrop !== allow) {
      this._allowDrop = allow;
      this.thumbnailDragService.unregisterDropThumbnails(this);
      this.thumbnailDragService.registerDropThumbnails(this);
    }
  }
  get allowDrop(): boolean {
    return this._allowDrop;
  }

  /**
   * size to fitSelected. Depends of direction layout
   */
  @Input()
  set fitSize(size: number) {
    if (this._fitSize !== size) {
      this._fitSize = size;
      this.computeSizes();
      this.thumbnailComponentRefs.forEach((componentRef: ComponentRef<PdfjsThumbnailComponent>) => {
        componentRef.instance.fitSize = size;
      });
    }
  }
  get fitSize(): number {
    return this._fitSize;
  }

  /**
   * Drag mode
   */
  @Input()
  set dragMode(drag: ThumbnailDragMode.NONE | ThumbnailDragMode.MOVE | ThumbnailDragMode.DUPLICATE) {
    if (this._dragMode !== drag) {
      this._dragMode = drag;
      this.thumbnailComponentRefs.forEach((componentRef: ComponentRef<PdfjsThumbnailComponent>) => {
        componentRef.instance.draggable = drag !== ThumbnailDragMode.NONE;
      });
    }
  }
  get dragMode(): ThumbnailDragMode.NONE | ThumbnailDragMode.MOVE | ThumbnailDragMode.DUPLICATE {
    return this._dragMode;
  }

  @Input()
  get borderWidth(): number {
    return this._borderWidth;
  }
  set borderWidth(value: number) {
    if (this._borderWidth !== value) {
      this._borderWidth = value;
      this.thumbnailComponentRefs.forEach((componentRef: ComponentRef<PdfjsThumbnailComponent>) => {
        componentRef.instance.borderWidth = value;
      });
    }
  }

  /**
   * Define the pdfjsGroupControl for thumbnail containers
   */
  @Input()
  pdfjsGroupControl: PdfjsGroupControl;

  constructor(
    private cfr: ComponentFactoryResolver,
    private defaultInjector: Injector,
    private appRef: ApplicationRef,
    public elementRef: ElementRef,
    private thumbnailDragService: ThumbnailDragService,
  ) {
  }

  /**
   * compute sizes of thumbnail
   */
  private computeSizes() {
    const thumbnails: HTMLElement = this.elementRef.nativeElement as HTMLElement;
    if (!!thumbnails) {
      if (this.vertical) {
        thumbnails.style.height = null;
        thumbnails.style.width = `${this._fitSize}px`;
      } else {
        thumbnails.style.width = null;
        thumbnails.style.height = `${this._fitSize}px`;
      }
    }
  }

  /**
   * Start process of drag thumbnail
   */
  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent) {
    this.itemToPreview = null;
    if (this._dragMode !== ThumbnailDragMode.NONE) {
      this.timeStart = new Date().getTime();
      const thumbnail: HTMLElement = this.thumbnailDragService.getFirstParentThumbnail(event.target as HTMLElement);
      const thumbnails: HTMLElement = this.elementRef.nativeElement as HTMLElement;
      const idx: number = this.thumbnailDragService.getIndexOfThumbnailInThumbnails(thumbnail, thumbnails);
      if (!isNaN(idx)) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/html', '<div></div>');
        this.thumbnailDragService.initDataTransfer(this.pdfjsControl.getItemByIndex(idx), this.pdfjsControl, idx, this._dragMode);
      }
    }
  }

  ngOnInit() {
    this.thumbnailDragService.registerDropThumbnails(this);
    this.itemEvent$.subscribe((itemEvent: PdfjsItemEvent) => {
      if (itemEvent.event === 'add') {
        this.addThumbnailComponentToDom(itemEvent.item, itemEvent.to);
      } else if (itemEvent.event === 'remove') {
        this.removeThumbnailComponentToDom(itemEvent.item, itemEvent.from);
      }
    });
    this.computeSizes();
  }

  ngOnDestroy() {
    this.thumbnailDragService.unregisterDropThumbnails(this);
  }

  /**
   * scrolling
   */
  @HostListener('scroll', [])
  onScroll() {
    this.itemToPreview = null;
  }

  @HostListener('mouseout', [])
  mouseOut() {
    this.itemToPreview = null;
  }

  public removeComponent(componentClass: Type<any>) {
    // Find the component
    /*    const component = this.components.find((component) => component.instance instanceof componentClass);
        const componentIndex = this.components.indexOf(component);

        if (componentIndex !== -1) {
          // Remove component from both view and array
          this.container.remove(this.container.indexOf(component));
          this.components.splice(componentIndex, 1);
        } */
  }

  private removeThumbnail(item: PdfjsItem) {
    this.itemToPreview = null;
    this.pdfjsControl.removeItem(item);
  }

  private selection(item: PdfjsItem) {
    this.pdfjsControl.selectItemIndex(this.pdfjsControl.indexOfItem(item));
    if (this.pdfjsGroupControl) {
      this.pdfjsGroupControl.selectControl(this.pdfjsControl);
    }
  }

  private nextThumbnail($event: PdfjsItem) {
    if (!!this.items) {
      if (!!this.items.length) {
        this.itemEvent$.next({event: 'add', item: this.items.shift()});
      } else {
        const time = new Date().getTime() - this.timeStart;
        const s = Math.trunc(time / 1000);
        const ms = time - s * 1000;
        this.render.emit({
          type: 'END',
          pages: this._pdfjsControl.getPageNumber(),
          time,
        });
        console.log(`Render ${this._pdfjsControl.getPageNumber()} pages in ${s}s ${ms}ms`);
      }
    }

  }

  /**
   * remove PdfjsThumbnailComponent from dom
   */
  private removeThumbnailComponentToDom(item: PdfjsItem, index: number) {
    const idx = this.thumbnailComponentRefs.findIndex((component: ComponentRef<PdfjsThumbnailComponent>) => {
      const it: PdfjsItem = component.instance.item;
      return it.pdfId === item.pdfId && it.pageIdx === item.pageIdx;
    });
    if (idx !== -1) {
      // Remove component from both view and array
      this.container.remove(idx);
      this.thumbnailComponentRefs.splice(idx, 1);
    }
  }

  /**
   * add ThumbnailComponent to dom
   */
  private addThumbnailComponentToDom(item: PdfjsItem, index: number) {
    if (index === undefined) {
      index = this.thumbnailComponentRefs.length;
    }
    const componentFactory = this.cfr.resolveComponentFactory(PdfjsThumbnailComponent);
    const componentRef: ComponentRef<PdfjsThumbnailComponent> = this.container.createComponent(componentFactory, index);
    this.thumbnailComponentRefs.splice(index, 0, componentRef);
    this.initThumbnailComponent(componentRef.instance, item);
  }

  private initThumbnailComponent(instance: PdfjsThumbnailComponent, item: PdfjsItem) {
    instance.quality = this._quality;
    instance.removable = this._allowRemove;
    instance.fitSize = this._fitSize;
    instance.draggable = this._dragMode !== ThumbnailDragMode.NONE;
    instance.layout = this.layout;
    instance.previewEnabled = !!this._previewDelay;

    instance.showPreview.subscribe(($event: PdfjsItem & DOMRect) => {
      if (!this.thumbnailDragService.dataTransferInitiated()) {
        this.itemToPreview = $event;
      }
    });
    instance.rendered.subscribe(($event: PdfjsItem) => {
      this.nextThumbnail($event);
    });
    instance.selectItem.subscribe(($event: PdfjsItem) => {
      this.selection($event);
    });
    instance.removeButtonClick.subscribe(($event: PdfjsItem) => {
      this.removeThumbnail($event);
    });
    instance.pdfjsControl = this._pdfjsControl;
    instance.pdfjsGroupControl = this.pdfjsGroupControl;
    instance.item = item;
  }
}
