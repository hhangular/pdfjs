import { Component, OnInit } from '@angular/core';
import {PdfjsControl} from '../../../../../../../projects/pdfjs-box/src/lib/classes/pdfjs-control';
import {ThumbnailDragMode, ThumbnailLayout, ViewFit} from '../../../../../../../projects/pdfjs-box/src/lib/classes/pdfjs-objects';

@Component({
  templateUrl: './examples-pdfjsview.component.html',
  styleUrls: ['./examples-pdfjsview.component.css']
})
export class ExamplesPdfjsViewComponent implements OnInit {

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
