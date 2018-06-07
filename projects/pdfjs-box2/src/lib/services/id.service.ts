import {Injectable} from '@angular/core';

@Injectable()
export class IdService {

  constructor() {
  }

  /**
   * Generate pdf id
   */
  getId(pdf: any) {
    let pdfId: string;
    if (pdf) {
      pdfId = pdf.id || pdf.url;
      if (!pdfId) {
        pdfId = !pdf.data ? this.hash(pdf) : this.uuid();
      }
    }
    return pdfId;
  }

  /**
   * Generate object hash
   */
  private hash(pdf) {
    return JSON.stringify(pdf);
  }

  /**
   * Generate uuid
   */
  public uuid() {
    const buf: Uint32Array = new Uint32Array(4);
    this.getCryptoObj().getRandomValues(buf);
    let idx = -1;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
      idx++;
      const r = (buf[idx >> 3] >> ((idx % 8) * 4)) & 15;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * return RandomSource implementation
   */
  private getCryptoObj(): RandomSource {
    return window.crypto || window['msCrypto'] as RandomSource || {
      getRandomValues: function (buf) {
        for (let i = 0, l = buf.length; i < l; i++) {
          buf[i] = Math.floor(Math.random() * 256);
        }
        return buf;
      }
    };
  }
}
