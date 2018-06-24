import {Component, OnInit} from '@angular/core';
import {GithubService} from '../github.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  version = '';
  url = '';

  constructor(private githubService: GithubService) {
  }

  ngOnInit(): void {
    this.githubService.getPackageJson().subscribe((json: any) => {
      console.log(json);
      this.version = json.version;
      this.url = json.repository.url;
    });
  }
}
