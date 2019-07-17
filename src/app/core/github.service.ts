import {HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, pipe} from 'rxjs';
import {share} from 'rxjs/operators';

@Injectable()
export class GithubService {

  public packageJson$: Observable<any>;
  public packageLockJson$: Observable<any>;

  constructor(private http: HttpClient) {
    this.packageJson$ = this.getPackageJson();
    this.packageLockJson$ = this.getPackageLockJson();
  }

  private getPackageJson() {
    return this.http.get<any>('https://raw.githubusercontent.com/hhangular/pdfjs/master/package.json').pipe(
      share()
    );
  }

  private getPackageLockJson() {
    return this.http.get<any>('https://raw.githubusercontent.com/hhangular/pdfjs/master/package-lock.json').pipe(
      share()
    );
  }
}
