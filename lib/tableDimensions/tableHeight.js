import { getWrapedText, getChildColumnId, getCellPadding, truncateText  } from "../index.js";

export function getTableHeight({ rowData, tableData, columnDimensions, finalColumnDimensions, prevWrapedData, columns, options }) {
    //if the data is unchanged. dont run calcRowHeights
    let wrappedTableData;

    if(JSON.stringify(finalColumnDimensions) === JSON.stringify(columnDimensions)){
        //only calc new row
        const wrappedTbleData = calcRowHeights(columns, [rowData], finalColumnDimensions, options);
        wrappedTableData = [...prevWrapedData, ...wrappedTbleData ];
    } else {
        //calc entire table
        const wrappedTbleData = calcRowHeights(columns, tableData, finalColumnDimensions, options);
        wrappedTableData = wrappedTbleData;
    }
    const tableHeight = wrappedTableData.reduce(( acc, val) => acc + val.rowHeight, 0)
    return [tableHeight, wrappedTableData]
};

export function calcRowHeights(columns, data, columnDimensions, options){
    let tableData = [...data];
   
    tableData.forEach((row, i) => {
        const [rowHeight, wrappedData] = getRowHeightAndWrapText(row, columnDimensions, columns, options);
        tableData[i] = {...tableData[i], rowHeight, data: wrappedData};
    });
    
    return tableData
};

export function getRowHeightAndWrapText(row, columnWidths, columns, options) {
    const { cellFont, cellTextSize = 10, cellLineHeight = cellTextSize, subHeadingWrapText, subHeadingFont, subHeadingTextSize = 10, subHeadingLineHeight = subHeadingTextSize, subHeadingHeight, subHeadingColumns, additionalWrapCharacters } = options;
    const cellPadding = getCellPadding(options, 'cell');
    const subHeadingPadding = getCellPadding(options, 'subheading');
    let tallestCell = 0;
    let wrappedData = {...row.data};

    columns.forEach((column) => {
        const { columnId } = column;

        //wrapText: false on the column definition - one line, truncated with an
        //ellipsis when it doesn't fit
        if(row.type === 'row' && column.wrapText === false) {
            const truncated = truncateText(cellFont, cellTextSize, columnWidths[columnId].actualWidth - (cellPadding.cellPaddingX * 2), row.data[columnId]);
            wrappedData = { ...wrappedData, [columnId]: [truncated]};
            if(tallestCell < 1) tallestCell = 1;
        }
        else if(row.type === 'row') {
            const wrappedText = getWrapedText(cellFont, cellTextSize, columnWidths[columnId].actualWidth - (cellPadding.cellPaddingX * 2), row.data[columnId], additionalWrapCharacters);
            wrappedData = { ...wrappedData, [columnId]: wrappedText}
            if(wrappedText.length > tallestCell) tallestCell = wrappedText.length;
        };

        if(row.type === 'subheading' && subHeadingWrapText) {
            const subHeadingColumnId = getChildColumnId(columnId, subHeadingColumns);
            if(!subHeadingColumnId) return;

            const wrappedText = getWrapedText(subHeadingFont, subHeadingTextSize, columnWidths[columnId].actualWidth - (subHeadingPadding.cellPaddingX * 2), row.data[subHeadingColumnId], additionalWrapCharacters);
            wrappedData = { ...wrappedData, [columnId]: wrappedText}
            if(wrappedText.length > tallestCell) tallestCell = wrappedText.length;
        };
        if(row.type === 'subheading' && !subHeadingWrapText) {
            const subHeadingColumnId = getChildColumnId(columnId, subHeadingColumns);
            if(!subHeadingColumnId) return;

            //cells expect an array of lines even when wrapping is off
            wrappedData = { ...wrappedData, [columnId]: [row.data[subHeadingColumnId]] };
            tallestCell = 1; // if there is no wrapping the array length will only ever be 1
        };
    });
    
    //subHeadingHeight acts as a minimum - the row still grows to fit wrapped text
    const rowHeight = row.type === 'row' ?
        tallestCell * cellLineHeight + (cellPadding.cellPaddingY * 2) :
        Math.max(tallestCell * subHeadingLineHeight + (subHeadingPadding.cellPaddingY * 2), subHeadingHeight ?? 0);

    return [rowHeight, wrappedData]; //TODO: THIS IS THE FINAL DATA THAT I NEED!!!!!!!!
};
