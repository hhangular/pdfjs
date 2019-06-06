import {HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GithubService {

  constructor(private http: HttpClient) { }

  public getPackageJson() {
    return this.http.get<any>('https://raw.githubusercontent.com/hhangular/pdfjs/master/package.json');
  }
}
