import {Component, OnInit} from '@angular/core';
import {
  faArrowsAlt, faBorderNone,
  faCogs,
  faDharmachakra,
  faDownload,
  faExpandArrowsAlt,
  faFilePdf as fasFilePdf, faGamepad, faListUl, faProjectDiagram, faWrench
} from '@fortawesome/free-solid-svg-icons';
import {faFilePdf as farFilePdf} from '@fortawesome/free-regular-svg-icons';
import {faBuromobelexperte} from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent implements OnInit {

  faDownload = faDownload;
  faCogs = faCogs;
  fasFilePdf = fasFilePdf;
  farFilePdf = farFilePdf;
  faDharmachakra = faDharmachakra;
  faProjectDiagram = faProjectDiagram
  faBuromobelexperte = faBuromobelexperte;
  faArrowsAlt = faArrowsAlt;
  faExpandArrowsAlt = faExpandArrowsAlt;
  faBorderNone = faBorderNone;
  faGamepad = faGamepad;
  faWrench = faWrench;
  faListUl = faListUl;

  constructor() {
  }

  ngOnInit(): void {
  }
}
