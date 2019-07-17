import {animate, state, style, transition, trigger} from '@angular/animations';
import {Component, ElementRef, HostBinding, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {InnerItem, RenderQuality, ThumbnailLayout} from '../../../classes/pdfjs-objects';
import {PdfjsItem} from '../../../classes/pdfjs-item';

@Component({
  selector: 'pdfjs-preview',
  templateUrl: './pdfjs-preview.component.html',
  styleUrls: ['./pdfjs-preview.component.css'],
  animations: [
    trigger('previewState', [
      state('hidden', style({
        display: 'none',
        transform: 'scale(0)',
      })),
      state('visible', style({
        display: 'block',
        transform: 'scale(1)',
      })),
      transition('hidden => visible', animate('100ms ease-in')),
      transition('visible => hidden', animate('100ms ease-out')),
    ]),
  ],
})
export class PdfjsPreviewComponent implements OnInit {

  @Input()
  set item(item: InnerItem) {
    if (!item) {
      this._item = null;
      this.state = 'hidden';
    }
    this.item$.next(item);
  }

  @HostBinding('@previewState')
  public state = 'inactive';

  public _item: InnerItem = null;

  @Input()
  public layout: ThumbnailLayout = ThumbnailLayout.HORIZONTAL;

  /**
   * Delay for show preview. 0 => disable preview
   */
  @Input()
  public delay = 0;

  /**
   * Height of preview
   */
  @Input()
  public height = 300;

  /**
   * Quality of preview
   */
  @Input()
  public quality: RenderQuality = 2;

  private item$: BehaviorSubject<InnerItem> = new BehaviorSubject<InnerItem>(null);

  constructor(private elementRef: ElementRef) {
  }

  public ngOnInit(): void {
    this.item$.pipe(
      debounceTime(this.delay),
    ).subscribe((item: InnerItem) => {
      this._item = item;
      const previewThumbnail: HTMLElement = this.elementRef.nativeElement;
      resetPreviewThumbnail(previewThumbnail);
      if (!!item) {
        const caretSize = 10;
        if (this.layout === ThumbnailLayout.HORIZONTAL) {
          this.addVerticalCaret(previewThumbnail, item, caretSize);
        } else {
          this.addHorizontalCaret(previewThumbnail, item, caretSize);
        }
      }
    });
  }

  /**
   * The thumbnail is rendered, position it and show it
   */
  public rendered(item: PdfjsItem) {
    const previewThumbnail: HTMLElement = this.elementRef.nativeElement;
    if (!!item) {
      const caretSize = 10;
      resetPreviewThumbnail(previewThumbnail);
      if (this.layout === ThumbnailLayout.HORIZONTAL) {
        this.addVerticalCaret(previewThumbnail, this._item, caretSize);
      } else {
        this.addHorizontalCaret(previewThumbnail, this._item, caretSize);
      }
      this.state = 'visible';
    } else {
      this.state = 'hidden';
    }
  }

  private addVerticalCaret(previewThumbnail: HTMLElement, item: PdfjsItem & DOMRect & { atLeft: boolean, atTop: boolean }, caretSize) {
    const rect: DOMRect = (item as DOMRect);
    const ratio = rect.width / rect.height;
    let cls = '';
    if (item.atTop) {
      cls = 'top';
      previewThumbnail.style.top = `${rect.y - this.height - caretSize}px`;
//      previewThumbnail.style.paddingBottom = `${caretSize}px`;
    } else {
      cls = 'bottom';
      previewThumbnail.style.top = `${rect.y + rect.height}px`;
      previewThumbnail.style.paddingTop = `${caretSize}px`;
    }
    if (item.atLeft) {
      cls += '-left';
      previewThumbnail.style.left = `${rect.x + rect.width - (this.height * ratio)}px`;
    } else {
      cls += '-right';
      previewThumbnail.style.left = `${rect.x}px`;
    }
    previewThumbnail.style.height = `${this.height + caretSize}px`;
    previewThumbnail.classList.add(cls);
  }

  private addHorizontalCaret(previewThumbnail: HTMLElement, item: PdfjsItem & DOMRect & { atLeft: boolean, atTop: boolean }, caretSize) {
    const rect: DOMRect = (item as DOMRect);
    const ratio = rect.width / rect.height;
    let cls = '';
    if (item.atLeft) {
      cls = 'left';
      const previewWidth = this.height * ratio;
      previewThumbnail.style.left = `${rect.x - (previewWidth + caretSize)}px`;
      previewThumbnail.style.paddingRight = `${caretSize}px`;
    } else {
      cls = 'right';
      previewThumbnail.style.left = `${rect.x + rect.width}px`;
      previewThumbnail.style.paddingLeft = `${caretSize}px`;
    }
    if (item.atTop) {
      cls += '-top';
      previewThumbnail.style.top = `${rect.y + rect.height - this.height}px`;
    } else {
      cls += '-bottom';
      previewThumbnail.style.top = `${rect.y}px`;
    }
    previewThumbnail.style.height = `${this.height}px`;
    previewThumbnail.classList.add(cls);
  }
}

function resetPreviewThumbnail(previewThumbnail: HTMLElement) {
  previewThumbnail.classList.remove('right-top', 'left-top',
    'right-bottom', 'left-bottom',
    'top-left', 'top-right',
    'bottom-left', 'bottom-right');
  previewThumbnail.style.right = undefined;
  previewThumbnail.style.left = undefined;
  previewThumbnail.style.bottom = undefined;
  previewThumbnail.style.top = undefined;
  previewThumbnail.style.paddingBottom = '0px';
  previewThumbnail.style.paddingTop = '0px';
  previewThumbnail.style.paddingLeft = '0px';
  previewThumbnail.style.paddingRight = '0px';
}
