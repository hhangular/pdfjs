import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import {PdfjsItem, ThumbnailLayout} from '../../classes/pdfjs-objects';
import {PDFPromise, PDFRenderTask} from 'pdfjs-dist';
import {Pdfjs} from '../../services';
import {PdfjsControl} from '../../classes/pdfjs-control';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'pdfjs-thumbnail',
  templateUrl: './pdfjs-thumbnail.component.html',
  styleUrls: ['./pdfjs-thumbnail.component.css']
})
export class PdfjsThumbnailComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvas')
  canvasRef: ElementRef;

  @Output()
  removeItem: EventEmitter<PdfjsItem> = new EventEmitter<PdfjsItem>();

  @Output()
  selectItem: EventEmitter<PdfjsItem> = new EventEmitter<PdfjsItem>();

  @Input()
  pdfjsControl: PdfjsControl;

  @Input()
  draggable = false;

  @Input()
  layout: ThumbnailLayout = ThumbnailLayout.HORIZONTAL;

  @Input()
  removable = false;

  @Input()
  fitSize = 100;

  @Input()
  quality: 1 | 2 | 3 | 4 | 5 = 2;

  item$: BehaviorSubject<PdfjsItem> = new BehaviorSubject<PdfjsItem>(null);

  _item: PdfjsItem;

  pdfRenderTask: PDFRenderTask;

  @Input()
  set item(item: PdfjsItem) {
    this.item$.next(item);
    this._item = item;
  }

  get item(): PdfjsItem {
    return this._item;
  }

  @Input()
  set rotate(rotate: number) {
    this._item.rotate = this._item.rotate + rotate;
  }

  constructor(private elementRef: ElementRef, private pdfjs: Pdfjs) {
  }

  onClick(event: MouseEvent) {
    this.selectItem.emit(this.item);
  }

  ngAfterViewInit() {
    if (!!this._item) {
      this._item.rotate$.subscribe((rot: number) => {
        this.renderPdfjsItem(this._item);
      });
    }
  }

  renderPdfjsItem(pdfjsItem: PdfjsItem) {
    this.cancelRenderTask();
    const thumbnail: HTMLElement = this.elementRef.nativeElement;
    thumbnail.classList.add('not_rendered');
    if (!!pdfjsItem) {
      // fixed size used for fit
      const canvasSize = this.fitSize - 10;

      const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
      let promise: PDFPromise<PDFPromise<any>>;
      if (this.layout === ThumbnailLayout.VERTICAL) {
        (this.elementRef.nativeElement as HTMLElement).style.width = `${this.fitSize}px`;
        promise = this.pdfjs.renderItemInCanvasWidthFitted(pdfjsItem, this.quality, canvas, canvasSize);
      } else {
        (this.elementRef.nativeElement as HTMLElement).style.height = `${this.fitSize}px`;
        promise = this.pdfjs.renderItemInCanvasHeightFitted(pdfjsItem, this.quality, canvas, canvasSize);
      }
      promise.then((obj: any) => {
        thumbnail.classList.remove('not_rendered');
        this.pdfRenderTask = obj.pdfRenderTask as PDFRenderTask;
      });
    }
  }

  ngOnDestroy() {
    this.cancelRenderTask();
    this.pdfjs.destroyCanvas(this.canvasRef.nativeElement);
  }
  private cancelRenderTask() {
    if (!!this.pdfRenderTask && this.pdfRenderTask.cancel) {
      this.pdfRenderTask.cancel();
    }
  }

}
