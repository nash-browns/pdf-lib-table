import { getTextWidth, getWidestWordWidth, getWrapedText, getCellPadding } from "../";
import { updateIntrinsicPercentageWidth } from "../columns";

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
    const { headerTextSize, headerFont, maxTableWidth } = options;
    const { cellPaddingX } = getCellPadding(options, 'header');

    let columnDimensions;

    columns.forEach((col) => {
        const columnMinWidth = getTextWidth(headerFont, headerTextSize, col.header) + (cellPaddingX * 2);

        columnDimensions =  {...columnDimensions, [col.columnId]: {
            columnMinWidth: columnMinWidth,
            maxColumnWidth: columnMinWidth,
            intrinsicPercentageWidth: updateIntrinsicPercentageWidth(columnMinWidth, maxTableWidth),
        }};
    });

    return columnDimensions;

}

export function columnWidthWrap(columns, options) {
    const { headerTextSize, headerFont, maxTableWidth, additionalWrapCharacters } = options;
    const { cellPaddingX } = getCellPadding(options, 'header');

    let columnDimensions;

    columns.forEach((col) => {
        const headerStringLength = getTextWidth(headerFont, headerTextSize, col.header+' ') + (cellPaddingX * 2); //may need to adjust this at some point in the future
        const columnMinWidth = getWidestWordWidth(headerFont, headerTextSize, col.header, additionalWrapCharacters) + (cellPaddingX * 2);

        columnDimensions =  {...columnDimensions, [col.columnId]: {
            columnMinWidth: columnMinWidth,
            maxColumnWidth: headerStringLength,
            intrinsicPercentageWidth: updateIntrinsicPercentageWidth(headerStringLength, maxTableWidth),
        }};
    });

    return columnDimensions;
}

export function wrapHeader({columns, columnDimensions, headerLineHeight, headerTextSize, headerFont, additionalWrapCharacters, cellPaddingX = 0, cellPaddingY = 0}) {
    const  wrappedHeaders = columns.map(({ columnId, header }) => {
        const wrappedText = getWrapedText(headerFont, headerTextSize, columnDimensions[columnId].actualWidth - (cellPaddingX * 2), header, additionalWrapCharacters);
        return { columnId: columnId, data: wrappedText, height: wrappedText.length * headerLineHeight + (cellPaddingY * 2) }
    });

    return wrappedHeaders;
}
