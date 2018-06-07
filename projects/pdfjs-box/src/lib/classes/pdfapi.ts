import {PDFDocumentProxy, PDFPromise, TextContent} from 'pdfjs-dist';
export declare class PdfAPI {
  apiCompatibilityParams: any;
  build: string;
  version: string;

  AnnotationLayer: AnnotationLayer;
  GlobalWorkerOptions: GlobalWorkerOptions;
  InvalidPDFException: InvalidPDFException;
  LinkTarget: LinkTarget;
  LoopbackPort: LoopbackPort;
  MissingPDFException: MissingPDFException;
  NativeImageDecoding: NativeImageDecoding;
  OPS: OPS;
  PDFDataRangeTransport: PDFDataRangeTransport;
  PDFWorker: PDFWorker;
  PasswordResponses: PasswordResponses;
  RenderingCancelledException: RenderingCancelledException;
  SVGGraphics: SVGGraphics;
  UNSUPPORTED_FEATURES: UNSUPPORTED_FEATURES;
  UnexpectedResponseException: UnexpectedResponseException;
  Util: Util;
  VerbosityLevel: VerbosityLevel;

  addLinkAttributes();


  createBlob(data: any, contentType: any): any;

  createObjectURL(data: any, contentType: any);

  createPromiseCapability(): any;

  createValidAbsoluteUrl(url: string, baseUrl: string): string;

  getDocument(src: string | PDFDataRangeTransport | Uint8Array |
    { data: Uint8Array } | { range: PDFDataRangeTransport } | { url: string }): PDFPromise<PDFDocumentProxy>;

  getFilenameFromUrl(url): string;

  removeNullCharacters(str: string);

  renderTextLayer(renderParameters: RenderParameters): TextLayerRenderTask;

  shadow(obj: any, prop: any, value: any): any;

}

export interface TextLayerRenderTask extends PDFPromise<TextContent> {

}

export declare class RenderParameters {
  textContent?: any;
  textContentStream?: any;
  container?: any;
  viewport?: any;
  textDivs?: any;
  textContentItemsStr?: any;
  enhanceTextSelection?: any;
  timeout?: any;
}

export declare class AnnotationLayer {
  static render(parameters: any): any;

  static update(parameters: any): any;
}

export interface GlobalWorkerOptions {
  workerPort: string;
  workerSrc: string;
}

export declare class InvalidPDFException {
}

export enum LinkTarget {
  NONE = 0,
  SELF = 1,
  BLANK = 2,
  PARENT = 3,
  TOP = 4
}

export declare class LoopbackPort {
  addEventListener(name: string, listener: any);

  constructor(defer: any);

  postMessage(obj: any, transfers: any): any;

  removeEventListener(name: any, listener: any): any;

  terminate(): any;
}

export declare class MissingPDFException {
}

export interface NativeImageDecoding {
  NONE: 'none';
  DECODE: 'decode';
  DISPLAY: 'display';
}

export interface OPS {
  beginAnnotation: 80;
  beginAnnotations: 78;
  beginCompat: 72;
  beginGroup: 76;
  beginImageData: 64;
  beginInlineImage: 63;
  beginMarkedContent: 69;
  beginMarkedContentProps: 70;
  beginText: 31;
  clip: 29;
  closeEOFillStroke: 27;
  closeFillStroke: 26;
  closePath: 18;
  closeStroke: 21;
  constructPath: 91;
  curveTo: 15;
  curveTo2: 16;
  curveTo3: 17;
  dependency: 1;
  endAnnotation: 81;
  endAnnotations: 79;
  endCompat: 73;
  endGroup: 77;
  endInlineImage: 65;
  endMarkedContent: 71;
  endPath: 28;
  endText: 32;
  eoClip: 30;
  eoFill: 23;
  eoFillStroke: 25;
  fill: 22;
  fillStroke: 24;
  lineTo: 14;
  markPoint: 67;
  markPointProps: 68;
  moveText: 40;
  moveTo: 13;
  nextLine: 43;
  nextLineSetSpacingShowText: 47;
  nextLineShowText: 46;
  paintFormXObjectBegin: 74;
  paintFormXObjectEnd: 75;
  paintImageMaskXObject: 83;
  paintImageMaskXObjectGroup: 84;
  paintImageMaskXObjectRepeat: 89;
  paintImageXObject: 85;
  paintImageXObjectRepeat: 88;
  paintInlineImageXObject: 86;
  paintInlineImageXObjectGroup: 87;
  paintJpegXObject: 82;
  paintSolidColorImageMask: 90;
  paintXObject: 66;
  rectangle: 19;
  restore: 11;
  save: 10;
  setCharSpacing: 33;
  setCharWidth: 48;
  setCharWidthAndBounds: 49;
  setDash: 6;
  setFillCMYKColor: 61;
  setFillColor: 54;
  setFillColorN: 55;
  setFillColorSpace: 51;
  setFillGray: 57;
  setFillRGBColor: 59;
  setFlatness: 8;
  setFont: 37;
  setGState: 9;
  setHScale: 35;
  setLeading: 36;
  setLeadingMoveText: 41;
  setLineCap: 3;
  setLineJoin: 4;
  setLineWidth: 2;
  setMiterLimit: 5;
  setRenderingIntent: 7;
  setStrokeCMYKColor: 60;
  setStrokeColor: 52;
  setStrokeColorN: 53;
  setStrokeColorSpace: 50;
  setStrokeGray: 56;
  setStrokeRGBColor: 58;
  setTextMatrix: 42;
  setTextRenderingMode: 38;
  setTextRise: 39;
  setWordSpacing: 34;
  shadingFill: 62;
  showSpacedText: 45;
  showText: 44;
  stroke: 20;
  transform: 12;
}

export declare class PDFDataRangeTransport {
  constructor(length: number, initialData: any);

  abort();

  addProgressListener(listener: any);

  addProgressiveReadListener(listener: any);

  addRangeListener(listener: any);

  onDataProgress(loaded: any);

  onDataProgressiveRead(chunk: any);

  onDataRange(begin: number, chunk: any);

  requestDataRange(begin: number, end: number);

  transportReady();
}

export declare class PDFWorker {
  messageHandler: any;

  port: any;

  promise: any;

  static fromPort(params);

  static getWorkerSrc();

  destroy();

  _initializeFromPort(port);

  _setupFakeWorker();

}

export interface PasswordResponses {
  NEED_PASSWORD: 1;
  INCORRECT_PASSWORD: 2;
}

export declare class RenderingCancelledException {
  constructor(msg, type);
}

export declare class SVGGraphics {
  constructor(commonObjs: any, objs: any, forceDataSchema: any);

  addFontStyle(fontObj: any);

  beginText();

  clip(type: any);

  closeEOFillStroke();

  closeFillStroke();

  closePath();

  closeStroke();

  constructPath(ops: any, args: any);

  convertOpList(operatorList: any);

  endPath();

  endText();

  eoFill();

  eoFillStroke();

  executeOpTree(opTree: any);

  fill();

  fillStroke();

  getSVG(operatorList: any, viewport: any);

  group(items: any);

  loadDependencies(operatorList: any);

  moveText(x: any, y: any);

  nextLine();

  paintFormXObjectBegin(matrix: any, bbox: any);

  paintFormXObjectEnd();

  paintImageMaskXObject(imgData: any);

  paintImageXObject(objId: any);

  paintInlineImageXObject(imgData: any, mask: any);

  paintJpegXObject(objId: any, w: any, h: any);

  paintSolidColorImageMask();

  restore();

  save();

  setCharSpacing(charSpacing: any);

  setDash(dashArray: any, dashPhase: any);

  setFillAlpha(fillAlpha: any);

  setFillRGBColor(r: number, g: number, b: number);

  setFont(details: any);

  setGState(states: any);

  setHScale(scale: any);

  setLeading(leading: any);

  setLeadingMoveText(x: number, y: number);

  setLineCap(style: any);

  setLineJoin(style: any);

  setLineWidth(width: number);

  setMiterLimit(limit: any);

  setStrokeAlpha(strokeAlpha: number);

  setStrokeRGBColor(r: number, g: number, b: number);

  setTextMatrix(a: any, b: any, c: any, d: any, e: any, f: any);

  setTextRise(textRise: any);

  setWordSpacing(wordSpacing: any);

  showText(glyphs: any);

  stroke();

  transform(a: any, b: any, c: any, d: any, e: any, f: any);

  _ensureClipGroup();

  _ensureTransformGroup();
}

export interface UNSUPPORTED_FEATURES {
}

export declare class UnexpectedResponseException {
  constructor(msg: string, status: any);
}

export declare class Util {
  appendToArray(arr1: any, arr2: any);

  apply3dTransform(m: any, v: any);

  applyInverseTransform(p: any, m: any);

  applyTransform(p: any, m: any);

  extendObj(obj1: any, obj2: any);

  getAxialAlignedBoundingBox(r: any, m: any);

  inherit(sub: any, base: any, prototype: any);

  intersect(rect1: any, rect2: any);

  inverseTransform(m: any);

  loadScript(src: any, callback: any);

  makeCssRgb(r: any, g: any, b: any);

  normalizeRect(rect: any);

  prependToArray(arr1: any, arr2: any);

  singularValueDecompose2dScale(m: any);

  toRoman(number: any, lowerCase: any);

  transform(m1: any, m2: any);
}

export interface VerbosityLevel {
  ERRORS: 0;
  WARNINGS: 1;
  INFOS: 5;
}
