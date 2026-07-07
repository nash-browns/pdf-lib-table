import { getTextWidth, getWidestWordWidth, getParentColumnId, getChildColumnId, getCellPadding } from "../";
import { updateIntrinsicPercentageWidth } from "./helpers";
import { distributeExcessTableWidth } from "./widthDistributionStrategies";
import { getTableHeight } from "../tableDimensions";
import { wrapHeader } from "../headerDimensions";

//the header is drawn from startingY down and the rows start below it, so the
//header's height counts against maxTableHeight (which reserves room for the
//continuation text below the table)
function getHeaderHeight(columns, columnDimensions, options) {
    //defaults must match the Header class constructor, which is the code that
    //actually draws the header this estimates
    const { headerFont, headerTextSize = 12, headerLineHeight = 12, additionalWrapCharacters } = options;
    const { cellPaddingX, cellPaddingY } = getCellPadding(options, 'header');

    const wrappedHeaders = wrapHeader({ columns, columnDimensions, headerLineHeight, headerTextSize, headerFont, additionalWrapCharacters, cellPaddingX, cellPaddingY });
    return Math.max(...wrappedHeaders.map(({ height }) => height));
};

export function calcColumnWidths(data, columns, columnHeaderWidths, maxTableHeight, options, forceFirstRow = false) {
    const { startingX } = options;

    //most of these are optomizations
    let columnDimensions = columnHeaderWidths;
    let tableData = [];
    let currentInternalTableDimensions;
    let finalTableHeight;
    const  dataLength = data.length;

    for (let loop = 0; loop < dataLength; loop++){
        tableData.push(data[loop])

        const finalColumnDimensions = adjustColumnWidth({ rowData: data[loop], rowType: data[loop].type, columnDimensions, currentInternalTableDimensions, maxTableHeight, columns, options });
        const prevWrapedData = currentInternalTableDimensions ? currentInternalTableDimensions[2] : {}
        const [tableHeight, wrappedTableData] = getTableHeight({ rowData: data[loop], tableData, columnDimensions, finalColumnDimensions, prevWrapedData, columns, options })
        const headerHeight = getHeaderHeight(columns, finalColumnDimensions, options);

        //forceFirstRow guarantees appended pages always make progress, even when
        //a single row is taller than the available space
        if(headerHeight + tableHeight < maxTableHeight || (loop === 0 && forceFirstRow)) {
            currentInternalTableDimensions = [finalColumnDimensions, tableData, wrappedTableData]
            columnDimensions = finalColumnDimensions;
            finalTableHeight = tableHeight;
        } else {
            tableData.pop()
            break;
        }
    };

    //not even one row fit under the header - emit a header-only page and let
    //all the data flow to the next page
    if(!currentInternalTableDimensions) {
        currentInternalTableDimensions = [distributeExcessTableWidth(columnHeaderWidths, options), [], []];
        finalTableHeight = 0;
    }

    const remainingData = data.slice(tableData.length);

    let [finalColumnDimensions, tableHeight, wrappedTableData] = currentInternalTableDimensions;

    //adding the starting x for each column
    let startingXCounter = startingX;
    Object.keys(finalColumnDimensions).forEach((col) => {
        finalColumnDimensions = {...finalColumnDimensions, [col]: {...finalColumnDimensions[col], startingX: startingXCounter}};
        
        startingXCounter += finalColumnDimensions[col].actualWidth;
    })

    return [finalColumnDimensions, finalTableHeight, wrappedTableData, remainingData];
};

export function adjustColumnWidth({ rowData, rowType, columnDimensions, options }){
    const { cellFont, cellTextSize, subHeadingFont, subHeadingTextSize, maxTableWidth, subHeadingWrapText, subHeadingColumns } = options; 
    
    let adjustedColumnDimensions = columnDimensions
    const cols = Object.keys(adjustedColumnDimensions)

    for (let loop = 0; loop < cols.length; loop++) {           
        if(rowType === 'subheading' && !subHeadingWrapText) return;

        let font = cellFont;
        let textSize = cellTextSize;
        let columnDataId = cols[loop];
        let text = rowData.data[columnDataId];

        if( rowType === 'subheading' ) {
            const childColumnId = getChildColumnId(cols[loop], subHeadingColumns);
            columnDataId = false;
            if(childColumnId) {
                font = subHeadingFont;
                textSize = subHeadingTextSize;
                columnDataId = getParentColumnId(childColumnId, subHeadingColumns)
                text = rowData.data[childColumnId];
            }
        }

        if(!columnDataId) continue;

        const { cellPaddingX } = getCellPadding(options, rowType === 'subheading' ? 'subheading' : 'cell');
        const cellStringLength = getTextWidth(font, textSize, text+' ') + (cellPaddingX * 2);
        const cellMinWidth = getWidestWordWidth(font, textSize, text, options.additionalWrapCharacters) + (cellPaddingX * 2);
        
        if(adjustedColumnDimensions[columnDataId].columnMinWidth < cellMinWidth && text != '') adjustedColumnDimensions[columnDataId].columnMinWidth = cellMinWidth;
        if(adjustedColumnDimensions[columnDataId].maxColumnWidth < cellStringLength) adjustedColumnDimensions[columnDataId].maxColumnWidth = cellStringLength;
        adjustedColumnDimensions[columnDataId].intrinsicPercentageWidth = updateIntrinsicPercentageWidth(adjustedColumnDimensions[columnDataId].maxColumnWidth, maxTableWidth);
    };
    
    //Find the actual column widths
    const finalColumnDimensions = distributeExcessTableWidth(adjustedColumnDimensions, options);
    

    return finalColumnDimensions //adjust this...
};
