import {Component, OnInit} from '@angular/core';
import {GithubService} from '../github.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavBarComponent implements OnInit {

  public version = '';
  public url = '';

  constructor(private githubService: GithubService) {
  }

  public ngOnInit(): void {
    this.githubService.getPackageJson().subscribe((json: any) => {
      this.version = json.version;
      this.url = json.repository.url;
    });
  }
}
