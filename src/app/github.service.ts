import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  constructor(private http: HttpClient) { }

  getPackageJson() {
    return this.http.get<any>('https://raw.githubusercontent.com/hhangular/pdfjs/master/package.json');
  }
}
