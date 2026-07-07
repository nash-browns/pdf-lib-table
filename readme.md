a library for creating tables using pdf-lib 

currently a work in progress and subject to change.

Demo -> [pdf-lib-table](https://www.pdf-lib-table.com/)

Basic Usage

Define Columns:
```
    const columns = [
        {
            columnId:'header1',
            header: 'Header One',
        },
        {
            columnId:'header2',
            header: 'Header Two',
        },
        {
            columnId:'header3',
            header: 'Header Three',
        },
        {
            columnId:'header4',
            header: 'Header Four',
        }
    ]
```
build data:
```
    const data = [
        {
            header1: 'row1Column1',
            header2: 'row1Column2',
            header3: 'row1Column3',
            header4: 'row1Column4',
        },
        {
            header1: 'row2Column1',
            header2: 'row2Column2',
            header3: 'row2Column3',
            header4: 'row2Column4',
        },
        {
            header1: 'row3Column1',
            header2: 'row3Column2',
            header3: 'row3Column3',
            header4: 'row3Column4',
        },
        {
            header1: 'row4Column1',
            header2: 'row4Column2',
            header3: 'row4Column3',
            header4: 'row4Column4',
        },
    ]
```
Draw Table:
```
drawTable({
    data,                       // Required - No Default - data to be printed
    page,                       // Required - No Default - page provided by pdf-lib
    pdfDoc,                     // Required - No Default - pdfDoc that the table will be printed on
    columns,                    // Required - No Default - column definitions
    //TABLE SETTINGS
    startingX,                  // Default 0 - Default 0 - the starting x coordinate
    startingY,                  // Default 0 - the starting y coordinate
    tableType,                  // Default 'vertical' - Options: vertical || horizontal || 2way TODO: horizontal || 2way not supported yet
    dividedX,                   // Default true - sets if the table has x dividers
    dividedY,                   // Default true - sets if the table has y dividers
    dividedXColor,              // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
    dividedYColor,              // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
    dividedXThickness,          // Default 1 - sets x divider thickness
    dividedYThickness,          // Default 1 - sets y divider thickness
    maxTableWidth,              // Default false - table is defaulted to page width but a max value can be passed
    maxTableHeight,             // Default false - table is defaulted to page height but a max value can be passed
    rowHeightSizing,            // Default 'auto' //TODO: remove this.
    tableBorder,               // Default true - tables have a border by default but it can be removed by passing false
    tableBorderThickness,      // Default 1 - sets the thickness of the table border
    tableBorderColor,          // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
    rounded,                    //TODO: add or remove this option. Currently not supported
    customContinuesOnNextPage,  // Default false - can pass a function for what to draw
    smPageFiller,               // Default false - can pass a function for what to draw TODO: Currently not supported
    mdPageFiller,               // Default false - can pass a function for what to draw TODO: Currently not supported
    lgPageFiller,               // Default false - can pass a function for what to draw TODO: Currently not supported
    //SUB HEADINGS TODO: not supported yet
    subHeadingBackgroundColor,  //TODO: Currently not supported
    subHeadingHeight,           //TODO: Currently not supported
    subHeadingFont,             //TODO: Currently not supported
    subHeadingTextColor,        //TODO: Currently not supported
    subHeadingTextSize,         //TODO: Currently not supported
    //HEADER SETTINGS
    headerFont,                 // Required -  No Default - any pdflib standard font
    headerDividedX,             // Default true - sets if the table header has x dividers
    headerDividedY,             // Default true - sets if the table header has y divider
    headerDividedXColor,        // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
    headerDividedYColor,        // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
    headerDividedXThickness,    // Default 1 - sets the thickness of the table header x divider
    headerDividedYThickness,    // Default 1 - sets the thickness of the table header y divider
    headerBackgroundColor,      // Default - rgb(.03, .03, .03) - can pass in any pdf-lib rgb value
    headerHeight,               // Default 10 - height of the table header
    headerTextColor,            // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
    headerTextSize,             // Default 10 - table header text size
    headerTextAlignment,        // Default 'left' - left/right/center 
    headerWrapText,             // Default false - allows text in the header to wrap
    //CELL SETTINGS
    cellFont,                   // Required -  No Default - any pdflib standard font
    cellBackgroundColor,        //rgb(1, 1, 1) - can pass in any pdf-lib rgb value
    alternateRowColor,          // Default true - cell rows will alternate background color
    alternateCellColor,         //rgb(.03, .03, .03) - can pass in any pdf-lib rgb value
    cellTextSize,               // Default 10 - cell text size
    cellTextColor,              // Default rgb(0,0,0) - can pass in any pdf-lib rgb value
});
```