import {Component, OnInit} from '@angular/core';
import {PdfjsControl} from '../../../../../../projects/pdfjs-box/src/lib/classes/pdfjs-control';
import {ThumbnailDragMode, ThumbnailLayout} from '../../../../../../projects/pdfjs-box/src/lib/classes/pdfjs-objects';

@Component({
  templateUrl: './pdfjsthumbnails.component.html',
  styleUrls: ['./pdfjsthumbnails.component.css']
})
export class PdfjsThumbnailsComponent implements OnInit {

  pdfjsControl1: PdfjsControl = new PdfjsControl();
  pdfjsControl2: PdfjsControl = new PdfjsControl();

  ThumbnailLayout = ThumbnailLayout;
  ThumbnailDragMode = ThumbnailDragMode;

  ngOnInit() {
    this.pdfjsControl2.load('../assets/pdfs/conditions.pdf', true);
    this.pdfjsControl1.load('../assets/pdfs/guide.pdf', true);
  }

}
