import {Component, OnInit} from '@angular/core';
import {PdfjsControl} from '../../../projects/pdfjs-box/src/lib/classes/pdfjs-control';
import {ThumbnailDragMode, ThumbnailLayout, ViewFit} from '../../../projects/pdfjs-box/src/lib/classes/pdfjs-objects';
import {PdfjsGroupControl} from '../../../projects/pdfjs-box/src/lib/classes/pdfjs-group-control';

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
  pdfjsGroupControl: PdfjsGroupControl = new PdfjsGroupControl();
  pdfjsControl: PdfjsControl = new PdfjsControl();
  pdfjsControl1: PdfjsControl = new PdfjsControl();
  pdfjsControl2: PdfjsControl = new PdfjsControl();

  ThumbnailDragMode = ThumbnailDragMode;
  ThumbnailLayout = ThumbnailLayout;
  ViewFit = ViewFit;

  constructor() {
  }

  ngOnInit(): void {
    this.pdfjsControl.load('assets/pdfs/guide.pdf');
  }

  showPdf($event: any) {
    this.pdfjsControl.load($event.url);
  }
}
