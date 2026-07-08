import { checkUserInputs } from './lib/index.js'

import {
    Document,
    VerticalTable,
    Header,
    Row,
    SubHeading,
} from './classes/index.js';

//default colors
// const black = rgb(0, 0, 0);
// const white = rgb(1, 1, 1);
// const blue = rgb(.21, .24, .85);
// const grey = rgb(.03, .03, .03);

export async function createPDFTables(
    data, // Required - No Default - data to be printed
    page, // Required - No Default - page provided by pdf-lib
    pdfDoc, // Required - No Default - pdfDoc that the table will be printed on
    columns, // Required - No Default - column definitions
    fonts,
    colors,
    options = {
        tableType = 'vertical',
        //TABLE SETTINGS
        tableStartingX,
        tableStartingY,
        appendedTableStartingX,
        appendedTableStartingY,
        appendedTableMaxWidth,
        tableType,
        tableDividedX,
        tableDividedY,
        tableDividerXColor,
        tableDividerYColor,
        tableDividerXThickness,
        tableDividerYThickness,
        tableMaxWidth,
        // maxTableHeight,
        tableBorder,
        tableBorderThickness,
        tableBorderColor,
        tableBorderRadius,
        //CONTINUES
        continuationTextX ,
        continuationTextY,
        continuationFont,
        continuationFontSize,
        continuationFillerHeight,
        continuationText,
        //SUB HEADINGS
        subHeadingColumns, // Required - No Default - column definitions
        subHeadingBackgroundColor,
        subHeadingHeight,
        subHeadingFont, //Currently not supported
        subHeadingTextColor,
        subHeadingTextSize,
        subHeadingLineHeight,
        subHeadingDividedX,
        subHeadingDividerXThickness,
        subHeadingDividerXColor,
        subHeadingDividedY,
        subHeadingDividerYThickness,
        subHeadingDividerYColor,
        subHeadingWrapText,
        //HEADER SETTINGS
        headerFont, // Required -  No Default - any pdflib standard font
        headerDividedX,
        headerDividedY,
        headerDividerXColor,
        headerDividerYColor,
        headerDividerXThickness,
        headerDividerYThickness,
        headerBackgroundColor,
        headerHeight,
        headerTextColor,
        headerTextSize,
        headerTextAlignment,
        headerTextJustification,
        headerWrapText,
        //ROWSETTINGS
        rowBackgroundColor,
        rowAlternateColor,
        rowAlternateColorValue,

        //CELL SETTINGS
        cellFont, // Required -  No Default - any pdflib standard font
        cellTextSize,
        cellLineHeight,
        cellTextColor,
        additionalWrapCharacters,
        //cellPaddingBottom=0,
    } = {}) {

    //Check for bad data being passed
    const error = checkUserInputs(arguments);
    if(error) return error;

    //appended pages inherit the initial page's dimensions, so portrait/landscape
    //(or any custom size) carries through the whole table
    const initialPageSize = [page.getWidth(), page.getHeight()];

    // Build the document
    const document = new Document(page, pdfDoc, fonts, colors, options);

    //Add pages and print tables
    let remainingData = [...data];

    //Builds each page for the table.
        for (let loop = 0; remainingData.length > 0; loop++) {

            //add page to the doc if needed
            if(loop !== 0) document.addPage(initialPageSize);

            //create the table
            const page = document.pages[loop];

            // drawRuler(page.page, 'x', 25, rgb(.21, .24, .85));
            // drawRuler(page.page, 'y', 25, rgb(.21, .24, .85));

            const isInitPage = loop === 0 ? true : false;

            //resolve this page's table origin ONCE so every component (table
            //border, header, rows, cells, column dimensions) draws from the same
            //anchor - appended pages fall back to the initial values when
            //appendedTableStartingX/Y are not provided.
            //tableStartingY/appendedTableStartingY are measured DOWN from the top of the
            //page (0,0 = top-left corner); pdf-lib coordinates are bottom-origin,
            //so convert here - everything downstream works in pdf coordinates
            const startX = (isInitPage ? options.tableStartingX : options.appendedTableStartingX ?? options.tableStartingX) ?? 0;
            const startYFromTop = (isInitPage ? options.tableStartingY : options.appendedTableStartingY ?? options.tableStartingY) ?? 0;
            const startY = page.height - startYFromTop;

            //the table can never extend past the right edge of the page, so
            //tableMaxWidth is capped at the space between tableStartingX and the page
            //edge (and defaults to all of it when not provided)
            const availableWidth = page.width - startX;
            const requestedWidth = (isInitPage ? options.tableMaxWidth : options.appendedTableMaxWidth ?? options.tableMaxWidth) ?? availableWidth;
            const tableWidth = Math.min(requestedWidth, availableWidth);

            //without a borderColor pdf-lib emits the border as a path with no
            //paint operator, which renders inconsistently across viewers - the
            //documented default is black
            const tableBorderColor = options.tableBorderColor ?? colors(0, 0, 0);

            const pageOptions = { ...options, tableStartingX: startX, tableStartingY: startY, appendedTableStartingX: startX, appendedTableStartingY: startY, tableMaxWidth: tableWidth, appendedTableMaxWidth: tableWidth, tableBorderColor };

            const table = new VerticalTable(remainingData, columns, page, isInitPage, pageOptions, pageOptions);
            const data = table.data;

            const header = new Header(page, columns, table.columnDimensions, table.width, isInitPage, pageOptions, pageOptions);
            table.addHeader(header);

            //add rows to the table
            data.forEach((row) => {
                if(row.type === 'row') table.addRow(new Row(page, row.data, row.rowHeight, columns, table.width, table.columnDimensions, pageOptions, pageOptions));
                if(row.type === 'subheading') table.addRow(new SubHeading(page, row.data, row.rowHeight, options.subHeadingColumns, table.width, table.columnDimensions, pageOptions, pageOptions));
            });

            //add table to the document
            document.addTable(table);

            remainingData = table.remainingData;
        };

    return document;
};
