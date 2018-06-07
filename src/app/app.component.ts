import {Component, OnInit} from '@angular/core';
import {PdfjsControl} from '../../projects/pdfjs-box2/src/lib/classes/pdfjs-control';
import {LoggerService} from '../../projects/pdfjs-box2/src/lib/services';
import {ViewFit, ThumbnailDragMode, ThumbnailLayout} from '../../projects/pdfjs-box2/src/lib/classes/pdfjs-objects';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  pdfjsControl: PdfjsControl = new PdfjsControl();
  pdfjsControl1: PdfjsControl = new PdfjsControl();
  pdfjsControl2: PdfjsControl = new PdfjsControl();

  selectedPdfjsControl: PdfjsControl;

  ThumbnailDragMode = ThumbnailDragMode;
  ThumbnailLayout = ThumbnailLayout;
  ViewFit = ViewFit;
  constructor(
    private logger: LoggerService
  ) {
  }

  selectionItem(pdfjsControl: PdfjsControl) {
    this.selectedPdfjsControl = pdfjsControl;
  }

  ngOnInit(): void {
    this.pdfjsControl.load('assets/pdfs/guide.pdf');
  }
}
