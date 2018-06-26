import {ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {PdfjsItem} from '../../../classes/pdfjs-objects';

/** @ignore */
@Component({
  selector: 'pdfjs-remove-button',
  template: `<span class="remove-button">&nbsp;</span>`,
  styleUrls: ['./pdfjs-remove-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfjsRemoveButtonComponent {
  @Output()
  removeItem: EventEmitter<PdfjsItem> = new EventEmitter<PdfjsItem>();

  @Input()
  item: PdfjsItem;

  constructor() {
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    this.removeItem.emit(this.item);
  }

}
