//compile-only test for index.d.ts - checked with:
//  npx tsc --noEmit --strict -p test/tsconfig.json
//mirrors the README usage; a type error here means the declarations drifted
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import {
    createPDFTables,
    type ColumnDefinition,
    type SubHeadingColumnDefinition,
    type TableDataEntry,
    type TableOptions,
    type PDFTableDocument,
} from '../index.js';

async function readmeUsage(): Promise<void> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([792, 612]);

    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const columns: ColumnDefinition[] = [
        { columnId: 'serial', header: 'Serial' },
        { columnId: 'product', header: 'Product', wrapText: false },
        { columnId: 'price', header: 'Price', width: 60, align: 'right' },
    ];

    const subHeadingColumns: SubHeadingColumnDefinition[] = [
        { columnId: 'type', parentId: 'product' },
        { columnId: 'total', parentId: 'price', align: 'center' },
    ];

    const data: TableDataEntry[] = [
        { type: 'subheading', data: { type: 'Winter gear', total: '788.00' } },
        { type: 'row', data: { serial: '0-646-50584-X', product: 'Gloves', price: '701.00' } },
        { type: 'row', data: { serial: '0-10-349834-6', product: 'Boots', price: '87.00' } },
    ];

    const options: TableOptions = {
        headerFont: timesRomanBold,
        cellFont: timesRoman,
        continuationFont: timesRoman,
        subHeadingFont: timesRoman,
        subHeadingColumns,
        tableStartingX: 50,
        tableStartingY: 50,
        tableMaxWidth: 500,
        tableBorderRadius: 8,
        tableBorderColor: rgb(0, 0, 0),
        headerTextAlignment: 'center',
        headerTextJustification: 'bottom',
        rowAlternateColor: true,
        rowAlternateColorValue: rgb(0.9, 0.9, 0.9),
        cellLineHeight: 12,
        additionalWrapCharacters: ['-', '/'],
    };

    const document: PDFTableDocument = await createPDFTables(
        data, page, pdfDoc, columns, StandardFonts, rgb, options,
    );

    document.drawVerticalTables();

    const pageCount: number = document.pages.length;
    const firstTableWidth: number = document.tables[0].width;
    void pageCount;
    void firstTableWidth;

    await pdfDoc.save();
}

void readmeUsage;
