import {Injectable} from '@angular/core';

export class Configuration {
  constructor(public id: string, public version: number) {
  }
}

@Injectable({providedIn: 'root'})
export class ConfigService {
  constructor() {
    window['currentUser'] = window['currentUser'] || 'G';
  }

  initAutosaveConfiguration(cfg: any & Configuration) {
    return this.loadCfg(cfg);
  }

  private loadCfg(cfg: any & Configuration) {
    let currentCfg: any = cfg;
    const entry: string = localStorage.getItem(`${window['currentUser']}_${cfg.id}`);
    if (entry) {
      const fromStore: any = JSON.parse(entry);
      if (currentCfg.version === fromStore.version) {
        currentCfg = fromStore;
      } else {
        this.saveCfg.call(currentCfg); // equivalent to currentCfg._$$save
      }
    }
    return this.transformObject(currentCfg);
  }

  private transformObject(obj: any) {
    if (typeof obj !== 'object') {
      return obj;
    }
    const res: any = {};
    Object.keys(obj).forEach((key: string) => {
      if (key === 'version' || key === 'id') {
        res['_' + key] = obj[key];
        Object.defineProperty(res, key, {get: () => res[`_${key}`]});
      } else {
        if (obj[key] instanceof Array) {
          Object.defineProperty(res, key, {get: () => res[`_${key}`]});
          res['_' + key] = this.transformArray(obj[key], res);
        } else if (typeof obj[key] === 'object') {
          res['_' + key] = this.transformObject(obj[key]);
          Object.defineProperty(res, key, {get: () => res[`_${key}`]});
          res['_' + key]['_$$parent'] = res;
        } else {
          res['_' + key] = obj[key];
          Object.defineProperty(res, key, {
            get: () => res[`_${key}`],
            set: (v: any) => {
              res[`_${key}`] = v;
              this.saveCfg(res);
            }
          });
        }
      }
    });
    return res;
  }

  private transformArray(arr: any[], parent: any) {
    const res = [];
    const transformArray = this.transformArray;
    const transformObject = this.transformObject;
    arr.forEach(function (item: any) {
      let o;
      if (item instanceof Array) {
        o = transformArray(item, parent);
      } else {
        o = transformObject(item);
        if (typeof o === 'object') {
          o['_$$parent'] = parent;
        }
      }
      res.push(o);
    });
    return res;
  }

  private saveCfg(ori: any & Configuration) {
    while (ori['_$$parent']) {
      ori = ori['_$$parent'];
    }
    const res = this.prepareToStore(ori);
    localStorage.setItem(`${window['currentUser']}_${res.id}`, JSON.stringify(res));
  }

  private prepareToStore(ori: any) {
    if (typeof ori !== 'object') {
      return ori;
    }
    const prepareToStore = this.prepareToStore;
    let res;
    if (ori instanceof Array) {
      res = [];
      ori.forEach(function (item: any) {
        res.push(prepareToStore(item));
      });
    } else {
      res = {};
      Object.keys(ori).forEach(function (key: string) {
        if (key.indexOf('_$$') !== 0) {
          res[key.replace('_', '')] = prepareToStore(ori[key]);
        }
      });
    }
    return res;
  }
}
