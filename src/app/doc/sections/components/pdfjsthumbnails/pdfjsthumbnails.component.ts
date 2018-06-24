import {Component, OnInit} from '@angular/core';

@Component({
  templateUrl: './pdfjsthumbnails.component.html',
  styleUrls: ['./pdfjsthumbnails.component.css']
})
export class PdfjsThumbnailsComponent implements OnInit {

  navLinks: any = [
    {path: 'overview', label: 'OVERVIEW'},
    {path: 'api', label: 'API'},
    {path: 'examples', label: 'EXAMPLES'}
  ];

  constructor() {
  }

  ngOnInit() {

  }

}
