import { Component, OnInit } from '@angular/core';
import {PdfjsControl} from '../../../../../../projects/pdfjs-box/src/lib/classes/pdfjs-control';

@Component({
  templateUrl: './pdfpage.component.html',
  styleUrls: ['./pdfpage.component.scss']
})
export class PdfPageComponent implements OnInit {
  conditionCtrl: PdfjsControl = new PdfjsControl();

  constructor() {
  }

  ngOnInit() {
    this.conditionCtrl.load('../assets/pdfs/conditions.pdf');
  }

  showPdfPage() {
    alert(JSON.stringify(this.conditionCtrl.getPdfPages()));
  }
}
