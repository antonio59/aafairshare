declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface AutoTableStyles {
  fontSize?: number;
  cellWidth?: number | 'auto';
}

interface AutoTableColumnStyles {
  [key: number]: AutoTableStyles;
}

interface AutoTableMargin {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

interface AutoTableOptions {
  head: string[][];
  body: (string | number)[][];
  startY?: number;
  styles?: AutoTableStyles;
  columnStyles?: AutoTableColumnStyles;
  margin?: AutoTableMargin;
}
