import type { Color, PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib';

export type TextAlignment = 'left' | 'center' | 'right';
export type TextJustification = 'top' | 'center' | 'bottom';

/** Column definition - `columnId` keys into each row's `data` object. */
export interface ColumnDefinition {
    columnId: string;
    header: string;
    /** Fixed column width in points. Omit for automatic sizing. */
    width?: number;
    /** Cell text alignment. Header text follows `headerTextAlignment`. Default `'left'`. */
    align?: TextAlignment;
    /** When `false`, cell text stays on one line and is truncated with an ellipsis. Default `true`. */
    wrapText?: boolean;
}

/** Subheading column definition - the value lines up under the `parentId` column. */
export interface SubHeadingColumnDefinition {
    columnId: string;
    parentId: string;
    align?: TextAlignment;
}

export interface RowEntry {
    type: 'row';
    /** Keyed by `columnId`. */
    data: Record<string, string>;
}

export interface SubHeadingEntry {
    type: 'subheading';
    /** Keyed by the subheading `columnId`. */
    data: Record<string, string>;
}

export type TableDataEntry = RowEntry | SubHeadingEntry;

export interface TableOptions {
    //fonts (required - createPDFTables throws without them)
    headerFont: PDFFont;
    cellFont: PDFFont;
    continuationFont: PDFFont;
    subHeadingFont: PDFFont;

    //table
    /** Only `'vertical'` is currently supported. */
    tableType?: 'vertical';
    /** Left edge of the table, from the left edge of the page. Default `0`. */
    tableStartingX?: number;
    /** Top edge of the table, measured down from the top of the page. Default `0`. */
    tableStartingY?: number;
    /** Maximum table width; clamped to the page edge. Default: page width - `tableStartingX`. */
    tableMaxWidth?: number;
    /** Left edge on appended pages. Default: `tableStartingX`. */
    appendedTableStartingX?: number;
    /** Top edge on appended pages. Default: `tableStartingY`. */
    appendedTableStartingY?: number;
    /** Maximum width on appended pages; clamped to the page edge. Default: `tableMaxWidth`. */
    appendedTableMaxWidth?: number;
    /** Draw a border around the table. Default `true`. */
    tableBorder?: boolean;
    tableBorderThickness?: number;
    tableBorderColor?: Color;
    /** Rounded table corners - table content is clipped to the rounded shape. Default `0`. */
    tableBorderRadius?: number;
    /** Draw horizontal divider lines between rows. Default `true`. */
    tableDividedX?: boolean;
    /** Draw vertical divider lines between columns. Default `true`. */
    tableDividedY?: boolean;
    tableDividerXColor?: Color;
    tableDividerYColor?: Color;
    tableDividerXThickness?: number;
    tableDividerYThickness?: number;

    //continuation footer
    /** Text drawn below the table when it continues. Default `'Continues on Next Page'`. */
    continuationText?: string;
    continuationFontSize?: number;
    /** X position of the continuation text. Default: centered. */
    continuationTextX?: number;
    /** Y position of the continuation text from the page bottom. Default `10`. */
    continuationTextY?: number;
    /** Vertical space reserved below the table for the footer. Default `20`. */
    continuationFillerHeight?: number;

    //header
    /** Minimum header height - the header still grows to fit wrapped text. */
    headerHeight?: number;
    headerTextSize?: number;
    headerTextColor?: Color;
    headerBackgroundColor?: Color;
    /** Opacity of the header fill (0-1). Default `0.25`. */
    headerBackgroundOpacity?: number;
    /** Wrap header text within the column. Default `true`. */
    headerWrapText?: boolean;
    headerTextAlignment?: TextAlignment;
    headerTextJustification?: TextJustification;
    /** Draw the line under the header. Default `true`. */
    headerDividedX?: boolean;
    /** Draw vertical dividers between header cells. Default `true`. */
    headerDividedY?: boolean;
    headerDividerXColor?: Color;
    headerDividerYColor?: Color;
    headerDividerXThickness?: number;
    headerDividerYThickness?: number;

    //rows
    rowBackgroundColor?: Color;
    /** Opacity of row backgrounds, including the alternate color (0-1). Default `0.25`. */
    rowBackgroundOpacity?: number;
    /** Alternate the background color of every other row. Default `false`. */
    rowAlternateColor?: boolean;
    /** The alternate color (used when `rowAlternateColor` is `true`). */
    rowAlternateColorValue?: Color;

    //cells
    cellTextSize?: number;
    /** Cell line height - drives row height and text placement. Default: `cellTextSize`. */
    cellLineHeight?: number;
    cellTextColor?: Color;
    /** Horizontal padding between cell text and its dividers/border. Default `2`. */
    cellPaddingX?: number;
    /** Vertical padding between cell text and its dividers/border. Default `1`. */
    cellPaddingY?: number;
    /** Extra characters (beyond whitespace) that text may wrap on, e.g. `['-', '/']`. */
    additionalWrapCharacters?: string[];

    //subheadings
    subHeadingColumns?: SubHeadingColumnDefinition[];
    subHeadingTextSize?: number;
    /** Subheading line height - drives subheading row height. Default: `subHeadingTextSize`. */
    subHeadingLineHeight?: number;
    /** Minimum subheading row height - the row still grows to fit wrapped text. */
    subHeadingHeight?: number;
    /** Default: `cellTextColor`. */
    subHeadingTextColor?: Color;
    subHeadingBackgroundColor?: Color;
    /** Opacity of subheading backgrounds (0-1). Default `0.25`. */
    subHeadingBackgroundOpacity?: number;
    /** Wrap subheading text within its column. Default `false`. */
    subHeadingWrapText?: boolean;
    /** Draw the line under subheading rows. Default `false`. */
    subHeadingDividedX?: boolean;
    /** Draw vertical dividers between subheading cells. Default: follows `tableDividedY`. */
    subHeadingDividedY?: boolean;
    /** Default: `tableDividerYColor`. */
    subHeadingDividerYColor?: Color;
    /** Default: `tableDividerYThickness`. */
    subHeadingDividerYThickness?: number;
    subHeadingDividerXColor?: Color;
    subHeadingDividerXThickness?: number;
}

/** A page of the built document, wrapping the underlying pdf-lib page. */
export interface TablePage {
    readonly page: PDFPage;
    readonly width: number;
    readonly height: number;
}

/** One rendered table (one per page). */
export interface Table {
    readonly width: number;
    readonly startingX: number;
    readonly columnDimensions: Record<string, { startingX: number; actualWidth: number }>;
    readonly remainingData: TableDataEntry[];
}

/** Returned by `createPDFTables` - call `drawVerticalTables()` to draw. */
export interface PDFTableDocument {
    readonly pages: TablePage[];
    readonly tables: Table[];
    drawVerticalTables(): void;
}

/**
 * Builds the table (adding pages as needed) and returns a document object;
 * call `drawVerticalTables()` on it to draw.
 *
 * @param data    Row and subheading entries, in display order.
 * @param page    The initial page, from `pdfDoc.addPage()`.
 * @param pdfDoc  The pdf-lib `PDFDocument` the table is printed on.
 * @param columns Column definitions.
 * @param fonts   The `StandardFonts` import from pdf-lib.
 * @param colors  The `rgb` function from pdf-lib.
 * @param options See the README for the full list of options.
 */
export declare function createPDFTables(
    data: TableDataEntry[],
    page: PDFPage,
    pdfDoc: PDFDocument,
    columns: ColumnDefinition[],
    fonts: typeof StandardFonts,
    colors: typeof rgb,
    options: TableOptions
): Promise<PDFTableDocument>;
