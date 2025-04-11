// Type declarations for pdfmake/interfaces

declare module 'pdfmake/interfaces' {
  export interface TDocumentDefinitions {
    content: Content;
    styles?: StyleDictionary;
    defaultStyle?: Style;
    pageSize?: PageSize;
    pageOrientation?: PageOrientation;
    pageMargins?: Margins;
    header?: DynamicContent | StaticContent;
    footer?: DynamicContent | StaticContent;
    background?: DynamicContent | StaticContent;
    info?: DocumentInfo;
    compress?: boolean;
  }

  export type Content = ContentText | ContentStack | ContentTable | ContentUnorderedList | ContentOrderedList | ContentImage | ContentSvg | ContentToc | ContentNode | Content[] | { [key: string]: any };

  export interface ContentTable {
    table: TableLayout;
    layout?: TableLayoutFunctions | string;
    style?: string | string[];
    [key: string]: any;
  }

  export interface TableLayout {
    body: any[][];
    headerRows?: number;
    widths?: string[] | number[] | ('*' | 'auto')[];
    heights?: number[] | (number | '*')[];
    [key: string]: any;
  }

  export interface TableLayoutFunctions {
    hLineWidth?: (i: number, node: ContentTable) => number;
    vLineWidth?: (i: number, node: ContentTable) => number;
    hLineColor?: (i: number, node: ContentTable) => string;
    vLineColor?: (i: number, node: ContentTable) => string;
    paddingLeft?: (i: number, node: ContentTable) => number;
    paddingRight?: (i: number, node: ContentTable) => number;
    paddingTop?: (i: number, node: ContentTable) => number;
    paddingBottom?: (i: number, node: ContentTable) => number;
  }

  export interface ContentText {
    text: string | string[];
    style?: string | string[];
    alignment?: 'left' | 'center' | 'right' | 'justify';
    color?: string;
    bold?: boolean;
    italics?: boolean;
    margin?: Margins;
    [key: string]: any;
  }

  export interface ContentColumns {
    columns: Content[];
    qr: string; // Change qr property to match the expected type
    [key: string]: any;
  }

  export interface ContentStack {
    stack: Content[];
    [key: string]: any;
  }

  export interface ContentUnorderedList {
    ul: Content[];
    [key: string]: any;
  }

  export interface ContentOrderedList {
    ol: Content[];
    [key: string]: any;
  }

  export interface ContentImage {
    image: string;
    width?: number;
    height?: number;
    [key: string]: any;
  }

  export interface ContentSvg {
    svg: string;
    width?: number;
    height?: number;
    [key: string]: any;
  }

  export interface ContentQr {
    qr: string;
    [key: string]: any;
  }

  export interface ContentToc {
    toc: TableOfContent;
    [key: string]: any;
  }

  export interface ContentNode {
    nodeName: string;
    nodeType: number;
    [key: string]: any;
  }

  export interface TableOfContent {
    title?: Content;
    textStyle?: Style;
    numberStyle?: Style;
    [key: string]: any;
  }

  export interface Style {
    font?: string;
    fontSize?: number;
    fontFeatures?: FontFeature[];
    lineHeight?: number;
    bold?: boolean;
    italics?: boolean;
    alignment?: 'left' | 'center' | 'right' | 'justify';
    color?: string;
    background?: string;
    markerColor?: string;
    decoration?: 'underline' | 'lineThrough' | 'overline';
    decorationStyle?: 'dashed' | 'dotted' | 'double' | 'wavy';
    decorationColor?: string;
    margin?: Margins;
    [key: string]: any;
  }

  export interface StyleDictionary {
    [key: string]: Style;
  }

  export interface FontFeature {
    name: string;
    value: boolean | number;
  }

  export type PageSize = [number, number] | string;
  export type PageOrientation = 'portrait' | 'landscape';
  export type Margins = [number, number, number, number] | number;

  export interface DocumentInfo {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modDate?: Date;
    [key: string]: any;
  }

  export type DynamicContent = (currentPage: number, pageCount: number) => Content;
  export type StaticContent = Content;
}