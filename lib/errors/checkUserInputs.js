export function checkUserInputs(parameters) {
    

    if(!parameters[0]) {
        throw new Error('Data was not provided to the table.');
    }
    
    if(!parameters[1]) {
        throw new Error('An initioal page was not provided. You must provide an initial page.');
    }
    
    if(!parameters[2]) {
        throw new Error('An PFF Document was not provided. You must provide an PFF Document.');
    }
    
    if(!parameters[3]) {
        throw new Error('Column definitions were not provided. You must provide column definitions.');
    }
    
    if(!parameters[4]) {
        throw new Error('Fonts were not provided. You must provide the pdf lib standard fonts.');
    }
    
    if(!parameters[5]) {
        throw new Error('rgb was not provided. You must provide the pdf lib rgb function.');
    }

    const options = parameters[6]

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
    const pageHeight = parameters[1].getHeight();
    const maxOffset = pageHeight - reservedHeight;

    if(tableStartingY !== undefined && (tableStartingY < 0 || tableStartingY >= maxOffset)) {
        throw new Error(`tableStartingY (${tableStartingY}) leaves no room for the table. tableStartingY is measured down from the TOP of the page (0 = top edge), so it must be between 0 and the page height (${pageHeight}) minus continuationFillerHeight (${continuationFillerHeight}) and the table border.`);
    }

    const { tableStartingX, appendedTableStartingX } = options;
    const pageWidth = parameters[1].getWidth();

    if(tableStartingX !== undefined && (tableStartingX < 0 || tableStartingX >= pageWidth)) {
        throw new Error(`tableStartingX (${tableStartingX}) leaves no room for the table. tableStartingX is measured from the LEFT edge of the page, so it must be between 0 and the page width (${pageWidth}).`);
    }

    if(appendedTableStartingX !== undefined && (appendedTableStartingX < 0 || appendedTableStartingX >= pageWidth)) {
        throw new Error(`appendedTableStartingX (${appendedTableStartingX}) leaves no room for the table. appendedTableStartingX is measured from the LEFT edge of the page, so it must be between 0 and the page width (${pageWidth}).`);
    }

    if(appendedTableStartingY !== undefined && (appendedTableStartingY < 0 || appendedTableStartingY >= maxOffset)) {
        throw new Error(`appendedTableStartingY (${appendedTableStartingY}) leaves no room for the table. appendedTableStartingY is measured down from the TOP of the page (0 = top edge), so it must be between 0 and the page height (${pageHeight}) minus continuationFillerHeight (${continuationFillerHeight}) and the table border.`);
    }

   return false;
}
