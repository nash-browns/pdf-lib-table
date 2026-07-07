import { checkUserInputs } from './lib'

import {
    Document,
    VerticalTable,
    Header,
    Row,
    SubHeading,
} from './classes';

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
        pageDimensions,
        //TABLE SETTINGS
        startingX,
        startingY,
        appendedPageStartX,
        appendedPageStartY,
        appendedMaxTableWidth,
        tableType,
        dividedX,
        dividedY,
        dividedXColor,
        dividedYColor,
        dividedXThickness,
        dividedYThickness,
        maxTableWidth,
        // maxTableHeight,
        rowHeightSizing,
        tableBorder,
        tableBorderThickness,
        tableBorderColor,
        rounded,
        //CONTINUES
        continuesOnNextPage,
        continuationFiller,
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
        subHeadingDividedXThickness,
        subHeadingDividedXColor,
        subHeadingDividedY,
        subHeadingDividedYThickness,
        subHeadingDividedYColor,
        subHeadingWrapText,
        //HEADER SETTINGS
        headerFont, // Required -  No Default - any pdflib standard font
        headerDividedX,
        headerDividedY,
        headerDividedXColor,
        headerDividedYColor,
        headerDividedXThickness,
        headerDividedYThickness,
        headerBackgroundColor,
        headerHeight,
        headerTextColor,
        headerTextSize,
        headerLineHeight,
        headerTextAlignment,
        headerTextJustification,
        headerWrapText,
        //ROWSETTINGS
        rowBackgroundColor,
        alternateRowColor,
        alternateRowColorValue,

        //CELL SETTINGS
        cellFont, // Required -  No Default - any pdflib standard font
        cellTextSize,
        cellHeight,
        cellLineHeight,
        cellTextColor,
        additionalWrapCharacters,
        //cellPaddingBottom=0,
    } = {}) {

    //Check for bad data being passed
    const error = checkUserInputs(arguments);
    if(error) return error;

    // Build the document
    const document = new Document(page, pdfDoc, fonts, colors, options);

    //Add pages and print tables
    let remainingData = [...data];

    //Builds each page for the table.
        for (let loop = 0; remainingData.length > 0; loop++) {

            //add page to the doc if needed
            if(loop !== 0) document.addPage([792.0, 612.0]); 

            //create the table
            const page = document.pages[loop];

            // drawRuler(page.page, 'x', 25, rgb(.21, .24, .85));
            // drawRuler(page.page, 'y', 25, rgb(.21, .24, .85));

            const isInitPage = loop === 0 ? true : false;
            const table = new VerticalTable(remainingData, columns, page, isInitPage, options, options);
            const data = table.data;

            const header = new Header(page, columns, table.columnDimensions, table.width, isInitPage, options, options);
            table.addHeader(header);

            //add rows to the table
            data.forEach((row) => {
                if(row.type === 'row') table.addRow(new Row(page, row.data, row.rowHeight, columns, table.width, table.columnDimensions, options, options));
                if(row.type === 'subheading') table.addRow(new SubHeading(page, row.data, row.rowHeight, options.subHeadingColumns, table.width, table.columnDimensions, options, options));
            });

            //add table to the document
            document.addTable(table);

            remainingData = table.remainingData;
        };

    return document;
};
