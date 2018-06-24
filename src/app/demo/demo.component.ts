import {Component, OnInit} from '@angular/core';
import {PdfjsControl} from '../../../projects/pdfjs-box2/src/lib/classes/pdfjs-control';
import {ViewFit, ThumbnailDragMode, ThumbnailLayout} from '../../../projects/pdfjs-box2/src/lib/classes/pdfjs-objects';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit {

  editMode = false;

  pdfs: any[] = [
    {fn: 'condition.pdf', url: '/assets/pdfs/conditions.pdf'},
    {fn: 'guide.pdf', url: '/assets/pdfs/guide.pdf'},
    {fn: 'UnicodeStandard.pdf', url: '/assets/pdfs/UnicodeStandard.pdf'}
  ];
  pdfjsControl: PdfjsControl = new PdfjsControl();
  pdfjsControl1: PdfjsControl = new PdfjsControl();
  pdfjsControl2: PdfjsControl = new PdfjsControl();

  selectedPdfjsControl: PdfjsControl;

  ThumbnailDragMode = ThumbnailDragMode;
  ThumbnailLayout = ThumbnailLayout;
  ViewFit = ViewFit;

  constructor(
  ) {
  }

  selectionItem(pdfjsControl: PdfjsControl) {
    this.selectedPdfjsControl = pdfjsControl;
  }

  ngOnInit(): void {
    this.pdfjsControl.load('assets/pdfs/guide.pdf');
  }

  showPdf($event: any) {
    this.pdfjsControl.load($event.url);
  }
}
