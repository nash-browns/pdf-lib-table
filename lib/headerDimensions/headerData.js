import { getTextWidth, getWidestWordWidth, getWrapedText, getCellPadding } from "../index.js";
import { updateIntrinsicPercentageWidth } from "../columns/index.js";

export function calcColumnHeaderWidths(columns, options) {
    const { headerWrapText } = options;
    let columnDimensions;
    
    if(!headerWrapText) {
        columnDimensions = columnWidthNoWrap(columns, options);
    } else {
        columnDimensions = columnWidthWrap(columns, options);
    }

    return columnDimensions;
};

export function columnWidthNoWrap(columns, options) {
    const { headerTextSize = 12, headerFont, tableMaxWidth } = options;
    const { cellPaddingX } = getCellPadding(options, 'header');

    let columnDimensions;

    columns.forEach((col) => {
        const columnMinWidth = getTextWidth(headerFont, headerTextSize, col.header) + (cellPaddingX * 2);

        columnDimensions =  {...columnDimensions, [col.columnId]: {
            columnMinWidth: columnMinWidth,
            maxColumnWidth: columnMinWidth,
            intrinsicPercentageWidth: updateIntrinsicPercentageWidth(columnMinWidth, tableMaxWidth),
        }};
    });

    return columnDimensions;

}

export function columnWidthWrap(columns, options) {
    const { headerTextSize = 12, headerFont, tableMaxWidth, additionalWrapCharacters } = options;
    const { cellPaddingX } = getCellPadding(options, 'header');

    let columnDimensions;

    columns.forEach((col) => {
        const headerStringLength = getTextWidth(headerFont, headerTextSize, col.header+' ') + (cellPaddingX * 2); //may need to adjust this at some point in the future
        const columnMinWidth = getWidestWordWidth(headerFont, headerTextSize, col.header, additionalWrapCharacters) + (cellPaddingX * 2);

        columnDimensions =  {...columnDimensions, [col.columnId]: {
            columnMinWidth: columnMinWidth,
            maxColumnWidth: headerStringLength,
            intrinsicPercentageWidth: updateIntrinsicPercentageWidth(headerStringLength, tableMaxWidth),
        }};
    });

    return columnDimensions;
}

//wrapped header lines are spaced at headerTextSize - there is no separate line-height option
export function wrapHeader({columns, columnDimensions, headerTextSize = 12, headerFont, additionalWrapCharacters, cellPaddingX = 0, cellPaddingY = 0}) {
    const  wrappedHeaders = columns.map(({ columnId, header }) => {
        const wrappedText = getWrapedText(headerFont, headerTextSize, columnDimensions[columnId].actualWidth - (cellPaddingX * 2), header, additionalWrapCharacters);
        return { columnId: columnId, data: wrappedText, height: wrappedText.length * headerTextSize + (cellPaddingY * 2) }
    });

    return wrappedHeaders;
}
