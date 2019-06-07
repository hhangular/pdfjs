import { Component, OnInit } from '@angular/core';
import {PdfjsControl} from '../../../../../../../projects/pdfjs-box/src/lib/classes/pdfjs-control';
import {ThumbnailDragMode, ThumbnailLayout, ViewFit} from '../../../../../../../projects/pdfjs-box/src/lib/classes/pdfjs-objects';
import {faCopy, faFile} from '@fortawesome/free-regular-svg-icons';
import {
  faArrowLeft,
  faArrowRight, faEdit,
  faExpandArrowsAlt, faFilePdf,
  faSearchMinus,
  faSearchPlus,
  faSyncAlt,
  faUndo
} from '@fortawesome/free-solid-svg-icons';

@Component({
  templateUrl: './examples-pdfjsview.component.html',
  styleUrls: ['./examples-pdfjsview.component.css']
})
export class ExamplesPdfjsViewComponent implements OnInit {

  editMode = false;
  faCopy = faCopy;
  faUndo = faUndo;
  faArrowRight = faArrowRight;
  faArrowLeft = faArrowLeft;
  faFile = faFile;
  faSearchMinus = faSearchMinus;
  faSearchPlus = faSearchPlus;
  faExpandArrowsAlt = faExpandArrowsAlt;
  faSyncAlt = faSyncAlt;
  faEdit = faEdit;
  faFilePdf = faFilePdf;

  pdfjsControl: PdfjsControl = new PdfjsControl();

  ThumbnailDragMode = ThumbnailDragMode;
  ThumbnailLayout = ThumbnailLayout;
  ViewFit = ViewFit;

  constructor() {
  }

  ngOnInit() {
    this.pdfjsControl.load('/assets/pdfs/conditions.pdf', true);

  }

}
