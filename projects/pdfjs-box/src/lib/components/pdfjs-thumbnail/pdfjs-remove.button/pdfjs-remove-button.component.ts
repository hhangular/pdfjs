import {ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {PdfjsItem} from '../../../classes/pdfjs-item';

/** @ignore */
@Component({
  selector: 'pdfjs-remove-button',
  template: `<span class="remove-button">&nbsp;</span>`,
  styleUrls: ['./pdfjs-remove-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfjsRemoveButtonComponent {
  @Output()
  public removeItem: EventEmitter<PdfjsItem> = new EventEmitter<PdfjsItem>();

  @Input()
  public item: PdfjsItem;

  constructor() {
  }

  @HostListener('click', ['$event'])
  public onClick(event: MouseEvent) {
    this.removeItem.emit(this.item);
  }

}
