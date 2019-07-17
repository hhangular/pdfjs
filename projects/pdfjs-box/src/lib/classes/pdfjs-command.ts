import {PDFPromise} from 'pdfjs-dist';

export interface PdfjsCommand {

  /**
   * Get number of pages
   */
  getPageNumber(): number;

  /**
   * Select first page
   */
  selectFirst(): number;

  /**
   * Select last page
   */
  selectLast(): number;

  /**
   * Has pdf next page
   */
  nextIsSelectable(): boolean;

  /**
   * Has pdf previous page
   */
  previousIsSelectable(): boolean;

  /**
   * Select the item number index
   */
  selectItemIndex(index: number): number;

  /**
   * Select next page
   */
  selectNext(): number;

  /**
   * Select previous page
   */
  selectPrevious(): number;

  /**
   * unset selection
   */
  unselect(): number;

  /**
   * Rotate all pages
   */
  rotate(angle: number): void;

  /**
   * Rotate selected page
   */
  rotateSelected(angle: number): void;

  /**
   * Reload pdf
   */
  reload(): PDFPromise<number>;

  /**
   * Page index based 1
   */
  getSelectedPageIndex(): number;

  /**
   * Page index based 0
   */
  getSelectedItemIndex(): number;
}
