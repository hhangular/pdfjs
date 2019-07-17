import {Component, OnInit} from '@angular/core';
import {PdfjsControl} from '../../../../../../projects/pdfjs-box/src/lib/classes/pdfjs-control';
import {RenderQuality, ViewFit} from '../../../../../../projects/pdfjs-box/src/lib/classes/pdfjs-objects';

@Component({
  templateUrl: './pdfjsview.component.html',
  styleUrls: ['./pdfjsview.component.css']
})
export class PdfjsViewComponent implements OnInit {

  conditionCtrl: PdfjsControl = new PdfjsControl();

  fit: ViewFit = ViewFit.VERTICAL;

  ViewFit = ViewFit;

  quality: RenderQuality = 2;

  textLayer = true;

  keysNav = true;

  mouseWheelNav = false;

  scale = 1;

  ngOnInit() {
    this.conditionCtrl.load('../assets/pdfs/conditions.pdf', true);
  }

}
