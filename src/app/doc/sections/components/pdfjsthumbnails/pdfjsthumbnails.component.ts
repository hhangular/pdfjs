import {Component, OnInit} from '@angular/core';
import {PdfjsControl} from '../../../../../../projects/pdfjs-box/src/lib/classes/pdfjs-control';
import {
  RenderEvent,
  RenderQuality,
  ThumbnailDragMode,
  ThumbnailLayout
} from '../../../../../../projects/pdfjs-box/src/lib/classes/pdfjs-objects';

@Component({
  templateUrl: './pdfjsthumbnails.component.html',
  styleUrls: ['./pdfjsthumbnails.component.scss']
})
export class PdfjsThumbnailsComponent implements OnInit {

  conditionCtrl1: PdfjsControl = new PdfjsControl();
  conditionCtrl2: PdfjsControl = new PdfjsControl();
  conditionCtrl3: PdfjsControl = new PdfjsControl();
  conditionCtrl4: PdfjsControl = new PdfjsControl();
  conditionCtrl5: PdfjsControl = new PdfjsControl();
  guideCtrl1: PdfjsControl = new PdfjsControl();

  ThumbnailLayout = ThumbnailLayout;
  ThumbnailDragMode = ThumbnailDragMode;

  quality: RenderQuality = 1;
  allowRemove = false;
  allowDrop = true;
  dragMode = ThumbnailDragMode.DUPLICATE;
  fitSize = 100;
  previewDelay = 100;
  previewHeight = 300;
  previewQuality: RenderQuality = 2;
  layout = ThumbnailLayout.HORIZONTAL;
  borderWidth = 5;

  renderEndEvent: RenderEvent;

  ngOnInit() {
    this.guideCtrl1.load('../assets/pdfs/guide.pdf', true);
    this.conditionCtrl1.load('../assets/pdfs/conditions.pdf', true);
    this.conditionCtrl2.load('../assets/pdfs/conditions.pdf', true);
    this.conditionCtrl3.load('../assets/pdfs/conditions.pdf', true);
    this.conditionCtrl4.load('../assets/pdfs/conditions.pdf', true);
    this.conditionCtrl5.load('../assets/pdfs/conditions.pdf', true);
  }

  renderEvent($event: RenderEvent) {
    if ($event.type === 'END') {
      this.renderEndEvent = $event;
    }
  }
}
