export interface PdfjsCommand {

  /**
   * GEt number of pages
   */
  getNumberOfPages(): number;

  /**
   * Select first page
   */
  selectFirst();

  /**
   * Select last page
   */
  selectLast();

  /**
   * Has pdf next page
   */
  hasNext(): boolean;

  /**
   * Has pdf previous page
   */
  hasPrevious(): boolean;

  /**
   * Select next page
   */
  selectNext();

  /**
   * Select previous page
   */
  selectPrevious();

  /**
   * Rotate all pages
   */
  rotate(angle: number);

  /**
   * Rotate selected page
   */
  rotateSelected(angle: number);

  /**
   * Zoom selected page
   */
  zoom(zoom: number);

  /**
   * Fit selected page
   */
  fit();

  /**
   * Reload pdf
   */
  reload();

  /**
   * Page index based 1
   */
  getPageIndex(): number;
}
