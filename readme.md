# pdf-lib-table

A table add-on for [pdf-lib](https://pdf-lib.js.org/).

Currently a work in progress and subject to change.

Demo -> [pdf-lib-table](https://www.pdf-lib-table.com/)

## Installation

```
npm install pdf-lib-table pdf-lib
```

`pdf-lib` is a peer dependency.

## Basic usage

```js
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { createPDFTables } from 'pdf-lib-table';

const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([792, 612]);

const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

// column definitions - columnId keys into each row's data object
const columns = [
    { columnId: 'serial', header: 'Serial' },
    { columnId: 'product', header: 'Product' },
    { columnId: 'price', header: 'Price' },
];

// each entry is { type: 'row' | 'subheading', data: {...} }
const data = [
    { type: 'row', data: { serial: '0-646-50584-X', product: 'Gloves', price: '701.00' } },
    { type: 'row', data: { serial: '0-10-349834-6', product: 'Boots', price: '87.00' } },
];

const document = await createPDFTables(data, page, pdfDoc, columns, StandardFonts, rgb, {
    tableStartingX: 50,     // 50pt from the left edge of the page
    tableStartingY: 50,     // 50pt down from the top of the page
    headerFont: timesRomanBold,
    cellFont: timesRoman,
    cellLineHeight: 12,
    continuationFont: timesRoman,
    subHeadingFont: timesRoman,
});

document.drawVerticalTables();

const pdfBytes = await pdfDoc.save();
```

`createPDFTables(data, page, pdfDoc, columns, fonts, colors, options)` builds the table
(adding pages as needed) and returns a document object; call `drawVerticalTables()` on it
to draw. All seven arguments are required - `fonts` is the `StandardFonts` import and
`colors` is the `rgb` function, both from pdf-lib.

## Coordinates and sizing

- `tableStartingX` is the table's left edge, measured from the **left** edge of the page.
- `tableStartingY` is the table's top edge, measured **down from the top** of the page,
  so `tableStartingX: 0, tableStartingY: 0` puts the table in the top-left corner.
- `tableMaxWidth` defaults to the space between `tableStartingX` and the right edge of the
  page, and an explicit value is clamped so the table can never run off the page.
- Column widths are computed automatically from the content within `tableMaxWidth`;
  row heights are computed from the wrapped text.
- Values that leave no drawable room (a negative offset, a `tableStartingY` below the
  space reserved for the continuation footer, a `tableStartingX` past the page edge)
  throw a descriptive error.

## Multi-page tables

Rows that don't fit are carried onto automatically appended pages, with the header
repeated and a continuation footer (default `'Continues on Next Page'`) drawn on every
page except the last. `continuationFillerHeight` reserves the space for that footer below
the table.

The `appendedTableStartingX/Y` and `appendedTableMaxWidth` options position the table on
pages 2+ and default to the initial-page values. Appended pages are currently created at
792x612 (landscape US Letter).

## Options

### Table

| Option | Default | Description |
| --- | --- | --- |
| `tableType` | `'vertical'` | Only `'vertical'` is currently supported. |
| `tableStartingX` | `0` | Left edge of the table, from the left edge of the page. |
| `tableStartingY` | `0` | Top edge of the table, measured down from the top of the page. |
| `tableMaxWidth` | page width - `tableStartingX` | Maximum table width; clamped to the page edge. |
| `appendedTableStartingX` | `tableStartingX` | Left edge on appended pages. |
| `appendedTableStartingY` | `tableStartingY` | Top edge on appended pages. |
| `appendedTableMaxWidth` | `tableMaxWidth` | Maximum width on appended pages; clamped to the page edge. |
| `tableBorder` | `true` | Draw a border around the table. |
| `tableBorderThickness` | `1` | Border thickness. |
| `tableBorderColor` | black | Any pdf-lib `rgb` value. |
| `tableDividedX` | `true` | Draw horizontal divider lines between rows. |
| `tableDividedY` | `true` | Draw vertical divider lines between columns. |
| `tableDividerXColor` | black | Row divider color. |
| `tableDividerYColor` | black | Column divider color. |
| `tableDividerXThickness` | `1` | Row divider thickness. |
| `tableDividerYThickness` | `1` | Column divider thickness. |

### Continuation footer

| Option | Default | Description |
| --- | --- | --- |
| `continuationFont` | **Required** | Font for the continuation text. |
| `continuationText` | `'Continues on Next Page'` | Text drawn below the table when it continues. |
| `continuationFontSize` | `15` | Continuation text size. |
| `continuationTextX` | centered | X position of the continuation text. |
| `continuationTextY` | `10` | Y position of the continuation text from the page bottom. |
| `continuationFillerHeight` | `20` | Vertical space reserved below the table for the footer. |

### Header

| Option | Default | Description |
| --- | --- | --- |
| `headerFont` | **Required** | Any pdf-lib font. |
| `headerHeight` | text height | Minimum header height - gives `headerTextJustification` room to work; the header still grows to fit wrapped text. |
| `headerTextSize` | `12` | Header text size. |
| `headerTextColor` | black | Any pdf-lib `rgb` value. |
| `headerBackgroundColor` | none | Header fill, drawn at 25% opacity. |
| `headerWrapText` | `true` | Wrap header text within the column (wrapped lines are spaced at `headerTextSize`). |
| `headerTextAlignment` | `'left'` | `'left'`, `'center'` or `'right'`. |
| `headerTextJustification` | `'center'` | `'top'`, `'center'` or `'bottom'`. |
| `headerDividedX` | `true` | Draw the line under the header. |
| `headerDividedY` | `true` | Draw vertical dividers between header cells. |
| `headerDividerXColor` | black | Divider color. |
| `headerDividerYColor` | black | Divider color. |
| `headerDividerXThickness` | `1` | Divider thickness. |
| `headerDividerYThickness` | `1` | Divider thickness. |

### Rows

| Option | Default | Description |
| --- | --- | --- |
| `rowBackgroundColor` | none | Background color for every row, drawn at 25% opacity. |
| `rowAlternateColor` | `false` | Alternate the background color of every other row. |
| `rowAlternateColorValue` | none | The alternate color (used when `rowAlternateColor` is `true`). |

### Cells

| Option | Default | Description |
| --- | --- | --- |
| `cellFont` | **Required** | Any pdf-lib font. |
| `cellTextSize` | `10` | Cell text size. |
| `cellLineHeight` | `cellTextSize` | Cell line height - drives row height and text placement. |
| `cellTextColor` | black | Any pdf-lib `rgb` value. |
| `cellPaddingX` | `2` | Horizontal padding between cell text and its dividers/border. |
| `cellPaddingY` | `1` | Vertical padding between cell text and its dividers/border. |
| `additionalWrapCharacters` | none | Extra characters (beyond whitespace) that text may wrap on, e.g. `['-', '/']`. |

Divider and border strokes are centered on cell boundaries, so half of each line's
thickness intrudes into the cell; the effective padding grows automatically so text
stays clear of the lines at any thickness.

### Subheadings

Subheading rows span the table and print values under specific parent columns. Define
which columns a subheading uses with `subHeadingColumns`, then add
`{ type: 'subheading', data: {...} }` entries keyed by the subheading `columnId`:

```js
const subHeadingColumns = [
    { columnId: 'type', parentId: 'product' }, // value lines up under the product column
    { columnId: 'total', parentId: 'price' },
];

const data = [
    { type: 'subheading', data: { type: 'Winter gear', total: '788.00' } },
    { type: 'row', data: { serial: '0-646-50584-X', product: 'Gloves', price: '701.00' } },
];
```

| Option | Default | Description |
| --- | --- | --- |
| `subHeadingFont` | **Required** | Font for subheading text. |
| `subHeadingColumns` | none | Subheading column definitions (see above). |
| `subHeadingTextSize` | `10` | Subheading text size. |
| `subHeadingLineHeight` | `subHeadingTextSize` | Subheading line height - drives subheading row height. |
| `subHeadingHeight` | text height | Minimum subheading row height - the row still grows to fit wrapped text. |
| `subHeadingTextColor` | `cellTextColor` | Any pdf-lib `rgb` value. |
| `subHeadingBackgroundColor` | none | Background color for subheading rows, drawn at 25% opacity. |
| `subHeadingWrapText` | `false` | Wrap subheading text within its column. |
| `subHeadingDividedX` | `false` | Draw the line under subheading rows. |
| `subHeadingDividedY` | follows `tableDividedY` | Draw vertical dividers between subheading cells. |
| `subHeadingDividerYColor` | `tableDividerYColor` | Divider color. |
| `subHeadingDividerYThickness` | `tableDividerYThickness` | Divider thickness. |
| `subHeadingDividerXColor` | black | Divider color. |
| `subHeadingDividerXThickness` | `1` | Divider thickness. |

## Not yet implemented

These options are accepted but currently do nothing; they are planned:

- `tableType: 'horizontal'` and `'2way'`
- `pageDimensions` (appended pages are fixed at 792x612)
- `rounded` - rounded table corners
- `rowHeightSizing`
- `cellHeight` - explicit row height (row heights are computed from content)
- `continuesOnNextPage`, `continuationFiller` - custom continuation drawing
