import {PDFDocumentProxy, PDFLoadingTask, PDFPageProxy, PDFProgressData, PDFPromise, TextContent} from 'pdfjs-dist';
export declare class PdfAPI {
  public apiCompatibilityParams: any;
  public build: string;
  public version: string;

  public AnnotationLayer: AnnotationLayer;
  public GlobalWorkerOptions: GlobalWorkerOptions;
  public InvalidPDFException: InvalidPDFException;
  public LinkTarget: LinkTarget;
  public LoopbackPort: LoopbackPort;
  public MissingPDFException: MissingPDFException;
  public NativeImageDecoding: NativeImageDecoding;
  public OPS: OPS;
  public PDFDataRangeTransport: PDFDataRangeTransport;
  public PDFWorker: PDFWorker;
  public PasswordResponses: PasswordResponses;
  public RenderingCancelledException: RenderingCancelledException;
  public SVGGraphics: SVGGraphics;
  public UNSUPPORTED_FEATURES: any;
  public UnexpectedResponseException: UnexpectedResponseException;
  public Util: Util;
  public VerbosityLevel: VerbosityLevel;

  public addLinkAttributes();

  public createBlob(data: any, contentType: any): any;

  public createObjectURL(data: any, contentType: any);

  public createPromiseCapability(): any;

  public createValidAbsoluteUrl(url: string, baseUrl: string): string;

  public getDocument(src: string | PDFDataRangeTransport | Uint8Array |
    { data: Uint8Array } | { range: PDFDataRangeTransport } | { url: string },
                     pdfDataRangeTransport?: any,
                     passwordCallback?: (fn: (password: string) => void, reason: string) => string,
                     progressCallback?: (progressData: PDFProgressData) => void
  ): PDFLoadingTask<PDFDocumentProxy>;

  public getFilenameFromUrl(url): string;

  public removeNullCharacters(str: string);

  public renderTextLayer(renderParameters: RenderParameters): TextLayerRenderTask;

  public shadow(obj: any, prop: any, value: any): any;

}

export interface TextLayerRenderTask extends PDFLoadingTask<TextContent> {
  cancel();
}

export declare class RenderParameters {
  public textContent?: any;
  public textContentStream?: any;
  public container?: any;
  public viewport?: any;
  public textDivs?: any;
  public textContentItemsStr?: any;
  public enhanceTextSelection?: any;
  public timeout?: any;
}

export declare class AnnotationLayer {
  public static render(parameters: {annotations: any[], div: HTMLDivElement,
    page: any, viewport: any, linkService: any, downloadManager: any, imageResourcesPath: string,
    renderInteractiveForms: boolean,
  }): void;

  public static update(parameters: {annotations: any[], div: HTMLDivElement, viewport: any}): void;
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
  TOP = 4,
}

export declare class LoopbackPort {

  constructor(defer: any);
  public addEventListener(name: string, listener: any);

  public postMessage(obj: any, transfers: any): any;

  public removeEventListener(name: any, listener: any): any;

  public terminate(): any;
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

  public abort();

  public addProgressListener(listener: any);

  public addProgressiveReadListener(listener: any);

  public addRangeListener(listener: any);

  public onDataProgress(loaded: any);

  public onDataProgressiveRead(chunk: any);

  public onDataRange(begin: number, chunk: any);

  public requestDataRange(begin: number, end: number);

  public transportReady();
}

export declare class PDFWorker {
  public messageHandler: any;

  public port: any;

  public promise: any;

  public static fromPort(params);

  public static getWorkerSrc();

  public destroy();

  public _initializeFromPort(port);

  public _setupFakeWorker();

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

  public addFontStyle(fontObj: any);

  public beginText();

  public clip(type: any);

  public closeEOFillStroke();

  public closeFillStroke();

  public closePath();

  public closeStroke();

  public constructPath(ops: any, args: any);

  public convertOpList(operatorList: any);

  public endPath();

  public endText();

  public eoFill();

  public eoFillStroke();

  public executeOpTree(opTree: any);

  public fill();

  public fillStroke();

  public getSVG(operatorList: any, viewport: any);

  public group(items: any);

  public loadDependencies(operatorList: any);

  public moveText(x: any, y: any);

  public nextLine();

  public paintFormXObjectBegin(matrix: any, bbox: any);

  public paintFormXObjectEnd();

  public paintImageMaskXObject(imgData: any);

  public paintImageXObject(objId: any);

  public paintInlineImageXObject(imgData: any, mask: any);

  public paintJpegXObject(objId: any, w: any, h: any);

  public paintSolidColorImageMask();

  public restore();

  public save();

  public setCharSpacing(charSpacing: any);

  public setDash(dashArray: any, dashPhase: any);

  public setFillAlpha(fillAlpha: any);

  public setFillRGBColor(r: number, g: number, b: number);

  public setFont(details: any);

  public setGState(states: any);

  public setHScale(scale: any);

  public setLeading(leading: any);

  public setLeadingMoveText(x: number, y: number);

  public setLineCap(style: any);

  public setLineJoin(style: any);

  public setLineWidth(width: number);

  public setMiterLimit(limit: any);

  public setStrokeAlpha(strokeAlpha: number);

  public setStrokeRGBColor(r: number, g: number, b: number);

  public setTextMatrix(a: any, b: any, c: any, d: any, e: any, f: any);

  public setTextRise(textRise: any);

  public setWordSpacing(wordSpacing: any);

  public showText(glyphs: any);

  public stroke();

  public transform(a: any, b: any, c: any, d: any, e: any, f: any);

  public _ensureClipGroup();

  public _ensureTransformGroup();
}

export declare class UnexpectedResponseException {
  constructor(msg: string, status: any);
}

export declare class Util {
  public appendToArray(arr1: any, arr2: any);
  public apply3dTransform(m: any, v: any);
  public applyInverseTransform(p: any, m: any);
  public applyTransform(p: any, m: any);
  public extendObj(obj1: any, obj2: any);
  public getAxialAlignedBoundingBox(r: any, m: any);
  public inherit(sub: any, base: any, prototype: any);
  public intersect(rect1: any, rect2: any);
  public inverseTransform(m: any);
  public loadScript(src: any, callback: any);
  public makeCssRgb(r: any, g: any, b: any);
  public normalizeRect(rect: any);
  public prependToArray(arr1: any, arr2: any);
  public singularValueDecompose2dScale(m: any);
  public toRoman(num: any, lowerCase: any);
  public transform(m1: any, m2: any);
}

export interface VerbosityLevel {
  ERRORS: 0;
  WARNINGS: 1;
  INFOS: 5;
}
