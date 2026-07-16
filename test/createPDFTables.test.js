import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { createPDFTables } from '../index.js';

const columns = [
    { columnId: 'serial', header: 'Serial' },
    { columnId: 'product', header: 'Product' },
    { columnId: 'price', header: 'Price' },
];

function makeRows(count) {
    return Array.from({ length: count }, (_, i) => ({
        type: 'row',
        data: { serial: `0-646-50584-${i}`, product: `Product ${i}`, price: `${i}.00` },
    }));
}

//fresh pdf-lib document, page and fonts for each test - tables mutate the doc
async function makeDoc() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([792, 612]);
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const options = {
        tableStartingX: 50,
        tableStartingY: 50,
        headerFont: boldFont,
        cellFont: font,
        continuationFont: font,
        subHeadingFont: font,
    };
    return { pdfDoc, page, options };
}

describe('input validation', () => {
    test('throws when data is missing', async () => {
        await assert.rejects(createPDFTables(), /Data was not provided/);
    });

    test('throws when page is missing', async () => {
        await assert.rejects(createPDFTables(makeRows(1)), /initial page was not provided/);
    });

    test('throws when pdfDoc is missing', async () => {
        const { page } = await makeDoc();
        await assert.rejects(createPDFTables(makeRows(1), page), /PDF Document was not provided/);
    });

    test('throws when columns are missing', async () => {
        const { pdfDoc, page } = await makeDoc();
        await assert.rejects(createPDFTables(makeRows(1), page, pdfDoc), /Column definitions were not provided/);
    });

    test('throws a descriptive error when options are omitted entirely', async () => {
        //regression: this used to throw "ReferenceError: tableType is not defined"
        //from a broken default-parameter destructure
        const { pdfDoc, page } = await makeDoc();
        await assert.rejects(
            createPDFTables(makeRows(1), page, pdfDoc, columns, StandardFonts, rgb),
            /Header font not provided/,
        );
    });

    test('throws when a required font is missing from options', async () => {
        const { pdfDoc, page, options } = await makeDoc();
        delete options.cellFont;
        await assert.rejects(
            createPDFTables(makeRows(1), page, pdfDoc, columns, StandardFonts, rgb, options),
            /Cell font not provided/,
        );
    });

    test('throws when tableStartingY leaves no room for the table', async () => {
        const { pdfDoc, page, options } = await makeDoc();
        options.tableStartingY = 10000;
        await assert.rejects(
            createPDFTables(makeRows(1), page, pdfDoc, columns, StandardFonts, rgb, options),
            /tableStartingY \(10000\) leaves no room/,
        );
    });

    test('throws when tableStartingX is past the page edge', async () => {
        const { pdfDoc, page, options } = await makeDoc();
        options.tableStartingX = 10000;
        await assert.rejects(
            createPDFTables(makeRows(1), page, pdfDoc, columns, StandardFonts, rgb, options),
            /tableStartingX \(10000\) leaves no room/,
        );
    });
});

describe('rendering', () => {
    test('renders a single-page table and saves a valid PDF', async () => {
        const { pdfDoc, page, options } = await makeDoc();
        const document = await createPDFTables(makeRows(3), page, pdfDoc, columns, StandardFonts, rgb, options);

        document.drawVerticalTables();

        assert.equal(pdfDoc.getPageCount(), 1);
        const bytes = await pdfDoc.save();
        assert.equal(String.fromCharCode(...bytes.slice(0, 5)), '%PDF-');
    });

    test('paginates long tables onto appended pages', async () => {
        const { pdfDoc, page, options } = await makeDoc();
        const document = await createPDFTables(makeRows(100), page, pdfDoc, columns, StandardFonts, rgb, options);

        document.drawVerticalTables();

        assert.ok(pdfDoc.getPageCount() > 1, `expected multiple pages, got ${pdfDoc.getPageCount()}`);
        await pdfDoc.save();
    });

    test('appended pages inherit the initial page size', async () => {
        const { pdfDoc, page, options } = await makeDoc();
        const document = await createPDFTables(makeRows(100), page, pdfDoc, columns, StandardFonts, rgb, options);

        document.drawVerticalTables();

        for (const p of pdfDoc.getPages()) {
            assert.equal(p.getWidth(), 792);
            assert.equal(p.getHeight(), 612);
        }
    });

    test('every row lands on exactly one page', async () => {
        const { pdfDoc, page, options } = await makeDoc();
        const rowCount = 100;
        const document = await createPDFTables(makeRows(rowCount), page, pdfDoc, columns, StandardFonts, rgb, options);

        const printed = document.tables.reduce((sum, table) => sum + table.rows.length, 0);
        assert.equal(printed, rowCount);
    });

    test('renders subheading rows', async () => {
        const { pdfDoc, page, options } = await makeDoc();
        options.subHeadingColumns = [
            { columnId: 'type', parentId: 'product' },
            { columnId: 'total', parentId: 'price' },
        ];
        const data = [
            { type: 'subheading', data: { type: 'Winter gear', total: '788.00' } },
            ...makeRows(2),
        ];

        const document = await createPDFTables(data, page, pdfDoc, columns, StandardFonts, rgb, options);
        document.drawVerticalTables();

        assert.equal(pdfDoc.getPageCount(), 1);
        await pdfDoc.save();
    });

    test('renders with common styling options', async () => {
        const { pdfDoc, page, options } = await makeDoc();
        Object.assign(options, {
            tableMaxWidth: 500,
            tableBorderRadius: 8,
            tableBorderColor: rgb(0.2, 0.2, 0.8),
            headerBackgroundColor: rgb(0.9, 0.9, 0.9),
            rowAlternateColor: true,
            rowAlternateColorValue: rgb(0.95, 0.95, 0.95),
            headerTextAlignment: 'center',
        });

        const document = await createPDFTables(makeRows(5), page, pdfDoc, columns, StandardFonts, rgb, options);
        document.drawVerticalTables();
        await pdfDoc.save();
    });

    test('does not mutate the caller data array', async () => {
        const { pdfDoc, page, options } = await makeDoc();
        const data = makeRows(100);
        const snapshot = JSON.stringify(data);

        await createPDFTables(data, page, pdfDoc, columns, StandardFonts, rgb, options);

        assert.equal(JSON.stringify(data), snapshot);
    });
});
