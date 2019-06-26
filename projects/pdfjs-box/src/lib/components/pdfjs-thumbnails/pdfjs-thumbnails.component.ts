import {
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  HostBinding,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {PdfjsControl} from '../../classes/pdfjs-control';
import {PdfjsGroupControl} from '../../classes/pdfjs-group-control';
import {PdfjsItem, PdfjsItemEvent, RenderQuality, Selectors, ThumbnailDragMode, ThumbnailLayout} from '../../classes/pdfjs-objects';
import {ThumbnailDragService} from '../../services/thumbnail-drag.service';
import {PdfjsThumbnailComponent} from '../pdfjs-thumbnail/pdfjs-thumbnail.component';
import {logger} from 'codelyzer/util/logger';

@Component({
  selector: Selectors.THUMBNAILS,
  templateUrl: './pdfjs-thumbnails.component.html',
  styleUrls: ['./pdfjs-thumbnails.component.css'],
})
export class PdfjsThumbnailsComponent implements OnInit, OnDestroy {

  /**
   * Layout direction
   */
  @Input()
  set layout(layout: ThumbnailLayout) {
    this.vertical = layout !== ThumbnailLayout.HORIZONTAL;
    const thumbnails: HTMLElement = this.elementRef.nativeElement as HTMLElement;
    if (this.vertical) {
      thumbnails.style.width = `${this.fitSize}px`;
    } else {
      thumbnails.style.height = `${this.fitSize}px`;
    }
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
        /*
                distinctUntilChanged((x: PdfjsItemEvent, y: PdfjsItemEvent) => {
                  const notChange = ((x ? 1 : 0) ^ (y ? 1 : 0));
                  return !!notChange || x.item.equals(y.item);
                }),
        */
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
  public container: ViewContainerRef;

  @ViewChild('pdfjs-preview', {static: true})
  public previewRef: ElementRef;

  public ThumbnailDragMode = ThumbnailDragMode;

  @HostBinding('class.vertical')
  public vertical = false;
  public itemEvent$: Subject<PdfjsItemEvent> = new Subject<PdfjsItemEvent>();
  public thumbnailComponentRefs: Array<ComponentRef<PdfjsThumbnailComponent>> = [];
  public itemToPreview: PdfjsItem & DOMRect;

  /**
   * Delay for show preview. 0 => disable preview
   */
  @Input()
  public previewDelay = 0;

  /**
   * Height of preview
   */
  @Input()
  public previewHeight = 300;

  /**
   * The quality of pdf render
   */
  @Input()
  public quality: RenderQuality = 1;

  /**
   * The remove button on thumbnail is it visible
   */
  @Input()
  public allowRemove = false;

  /**
   * This container accept drop thumbnail
   */
  @Input()
  public allowDrop = false;

  /**
   * size to fit. Depends of direction layout
   */
  @Input()
  public fitSize = 100;

  /**
   * Drag mode
   */
  @Input()
  public dragMode: ThumbnailDragMode = ThumbnailDragMode.DUPLICATE;

  /**
   * Define the pdfjsGroupControl for thumbnail containers
   */
  @Input()
  public pdfjsGroupControl: PdfjsGroupControl;

  private _pdfjsControl: PdfjsControl;
  private init = false;
  private items: PdfjsItem[] = [];
  private timeStart = 0;

  constructor(
    private cfr: ComponentFactoryResolver,
    private defaultInjector: Injector,
    private appRef: ApplicationRef,
    public elementRef: ElementRef,
    private thumbnailDragService: ThumbnailDragService,
  ) {
  }

  /**
   * Start process of drag thumbnail
   */
  @HostListener('dragstart', ['$event'])
  public onDragStart(event: DragEvent) {
    this.itemToPreview = null;
    if (this.dragMode !== ThumbnailDragMode.NONE) {
      const thumbnail: HTMLElement = this.thumbnailDragService.getFirstParentThumbnail(event.target as HTMLElement);
      const thumbnails: HTMLElement = this.elementRef.nativeElement as HTMLElement;
      const idx: number = this.thumbnailDragService.getIndexOfThumbnailInThumbnails(thumbnail, thumbnails);
      if (!isNaN(idx)) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/html', '<div></div>');
        this.thumbnailDragService.initDataTransfer(this.pdfjsControl.getItemByIndex(idx), this.pdfjsControl, idx, this.dragMode);
      }
    }
  }

  public removeThumbnail(item: PdfjsItem) {
    this.itemToPreview = null;
    this.pdfjsControl.removeItem(item);
  }

  public ngOnInit() {
    this.thumbnailDragService.registerDropThumbnails(this);
    this.itemEvent$.subscribe((itemEvent: PdfjsItemEvent) => {
      if (itemEvent.event === 'add') {
        this.addThumbnailComponentToDom(itemEvent.item, itemEvent.to);
      } else if (itemEvent.event === 'remove') {
        this.removeThumbnailComponentToDom(itemEvent.item, itemEvent.from);
      }
    });
  }

  public ngOnDestroy() {
    this.thumbnailDragService.unregisterDropThumbnails(this);
  }

  public selection(item: PdfjsItem) {
    this.pdfjsControl.selectItemIndex(this.pdfjsControl.indexOfItem(item));
    if (this.pdfjsGroupControl) {
      this.pdfjsGroupControl.select(this.pdfjsControl);
    }
  }

  /**
   * scrolling
   */
  @HostListener('scroll', [])
  public onScroll() {
    this.itemToPreview = null;
  }

  @HostListener('mouseout', ['$event'])
  public mouseOut($event: MouseEvent) {
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

  private nextThumbnail($event: PdfjsItem) {
    if (!!this.items) {
      if (!!this.items.length) {
        this.itemEvent$.next({event: 'add', item: this.items.shift()});
      } else {
        const time = new Date().getTime() - this.timeStart;
        const s = Math.trunc(time / 1000);
        const ms = time - s * 1000;
        console.log(`Render ${this._pdfjsControl.getItemsLength()} pages in ${s}s ${ms}ms`);
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
    instance.item = item;
    instance.quality = this.quality;
    instance.removable = this.allowRemove;
    instance.fitSize = this.fitSize;
    instance.draggable = this.dragMode !== ThumbnailDragMode.NONE;
    instance.layout = this.layout;
    instance.previewEnabled = !!this.previewDelay;

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
  }
}
