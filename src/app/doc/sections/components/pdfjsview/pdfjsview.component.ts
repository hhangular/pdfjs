import {Component, OnInit} from '@angular/core';

@Component({
  templateUrl: './pdfjsview.component.html',
  styleUrls: ['./pdfjsview.component.css']
})
export class PdfjsViewComponent implements OnInit {

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
