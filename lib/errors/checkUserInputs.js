export function checkUserInputs(data, page, pdfDoc, columns, fonts, colors, options) {

    if(!data) {
        throw new Error('Data was not provided to the table.');
    }

    if(!page) {
        throw new Error('An initial page was not provided. You must provide an initial page.');
    }

    if(!pdfDoc) {
        throw new Error('A PDF Document was not provided. You must provide a PDF Document.');
    }

    if(!columns) {
        throw new Error('Column definitions were not provided. You must provide column definitions.');
    }

    if(!fonts) {
        throw new Error('Fonts were not provided. You must provide the pdf lib standard fonts.');
    }

    if(!colors) {
        throw new Error('rgb was not provided. You must provide the pdf lib rgb function.');
    }

    //FONTS
    if(!options.headerFont) {
        throw new Error('Header font not provided');
    }

    if(!options.continuationFont) {
        throw new Error('continuation font not provided');
    }

    if(!options.subHeadingFont) {
        throw new Error('Subheading font not provided');
    }

    if(!options.cellFont) {
        throw new Error('Cell font not provided');
    }

    //POSITION - tableStartingY/appendedTableStartingY are measured DOWN from the top of
    //the page (0 = table flush with the top edge). the space available for the
    //table is the page height minus tableStartingY minus the room reserved below the
    //table, so an offset at or beyond that limit means nothing can ever render.
    //(defaults must match the VerticalTable constructor)
    const { tableStartingY, appendedTableStartingY, continuationFillerHeight = 20, tableBorder = true, tableBorderThickness = 1 } = options;
    const reservedHeight = continuationFillerHeight + (tableBorder ? tableBorderThickness / 2 : 0);
    const pageHeight = page.getHeight();
    const maxOffset = pageHeight - reservedHeight;

    if(tableStartingY !== undefined && (tableStartingY < 0 || tableStartingY >= maxOffset)) {
        throw new Error(`tableStartingY (${tableStartingY}) leaves no room for the table. tableStartingY is measured down from the TOP of the page (0 = top edge), so it must be between 0 and the page height (${pageHeight}) minus continuationFillerHeight (${continuationFillerHeight}) and the table border.`);
    }

    const { tableStartingX, appendedTableStartingX } = options;
    const pageWidth = page.getWidth();

    if(tableStartingX !== undefined && (tableStartingX < 0 || tableStartingX >= pageWidth)) {
        throw new Error(`tableStartingX (${tableStartingX}) leaves no room for the table. tableStartingX is measured from the LEFT edge of the page, so it must be between 0 and the page width (${pageWidth}).`);
    }

    if(appendedTableStartingX !== undefined && (appendedTableStartingX < 0 || appendedTableStartingX >= pageWidth)) {
        throw new Error(`appendedTableStartingX (${appendedTableStartingX}) leaves no room for the table. appendedTableStartingX is measured from the LEFT edge of the page, so it must be between 0 and the page width (${pageWidth}).`);
    }

    if(appendedTableStartingY !== undefined && (appendedTableStartingY < 0 || appendedTableStartingY >= maxOffset)) {
        throw new Error(`appendedTableStartingY (${appendedTableStartingY}) leaves no room for the table. appendedTableStartingY is measured down from the TOP of the page (0 = top edge), so it must be between 0 and the page height (${pageHeight}) minus continuationFillerHeight (${continuationFillerHeight}) and the table border.`);
    }
}
