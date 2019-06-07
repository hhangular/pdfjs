import {Component, OnInit} from '@angular/core';
import {GithubService} from '../github.service';
import {faGithub} from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavBarComponent implements OnInit {

  faGithub = faGithub;
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
