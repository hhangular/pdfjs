import {AfterViewInit, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {PdfjsItem} from '../../../classes/pdfjs-objects';

@Component({
  selector: 'pdfjs-remove-button',
  template: `<span class="remove-button">X</span>`,
  styleUrls: ['./pdfjs-remove-button.component.css']
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
