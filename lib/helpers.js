import { measureText, segmentText, wrapText } from './textMeasurement.js';

//wrapping and measuring live in textMeasurement.js (cached); these keep the original names
export const getWrapedText = wrapText;

export const getTextWidth = measureText;

//this function takes a string and any characters the string needs to be broken by and returns an array of words
export const brakeStringIntoWords = (word, char) => [...segmentText(word, char)];

//inner padding between a cell's box (dividers/background) and its text.
//single source of the defaults - every consumer resolves padding through here.
//dividers and the table border are stroked CENTERED on cell boundaries, so half
//of each line's thickness intrudes into the cell - the effective padding grows
//by that intrusion so text stays clear of the lines at any thickness.
//context selects which lines surround the text: 'cell', 'header' or 'subheading'
//(defaults must match the drawing classes' constructor defaults)
export function getCellPadding(options = {}, context = 'cell') {
    const { cellPaddingX = 2, cellPaddingY = 1 } = options;

    const border = (options.tableBorder ?? true) ? (options.tableBorderThickness ?? 1) : 0;

    let horizontalLine; //lines above/below the text - eat into the vertical padding
    let verticalLine;   //lines left/right of the text - eat into the horizontal padding

    if(context === 'header') {
        horizontalLine = (options.headerDividedX ?? true) ? (options.headerDividerXThickness ?? 1) : 0;
        verticalLine = (options.headerDividedY ?? true) ? (options.headerDividerYThickness ?? 1) : 0;
    } else if(context === 'subheading') {
        horizontalLine = options.subHeadingDividedX ? (options.subHeadingDividerXThickness ?? 1) : 0;
        const subHeadingDividedY = options.subHeadingDividedY ?? (options.tableDividedY ?? true);
        verticalLine = subHeadingDividedY ? (options.subHeadingDividerYThickness ?? options.tableDividerYThickness ?? 1) : 0;
    } else {
        horizontalLine = options.tableDividedX ? (options.tableDividerXThickness ?? 1) : 0;
        verticalLine = options.tableDividedY ? (options.tableDividerYThickness ?? 1) : 0;
    }

    return {
        cellPaddingX: cellPaddingX + Math.max(verticalLine, border) / 2,
        cellPaddingY: cellPaddingY + Math.max(horizontalLine, border) / 2,
    };
};

export function getLongestWordFromString(string, options) {
    const { additionalWrapCharacters } = options;

    const words = segmentText(string, additionalWrapCharacters);
    return words.reduce((longest, word) => word.length > longest.length ? word : longest, '');
};

export function fileterObject(obj, predicate) {
    return Object.keys(obj)
    .filter( key => predicate(obj[key]) )
    .reduce( (res, key) => (res[key] = obj[key], res), {} );
};

export function sumColumnProperties(columnDimensions) {
    return Object.values(columnDimensions).reduce((acc, obj) => {
        acc.columnMinWidth += obj.columnMinWidth;
        acc.intrinsicPercentageWidth += obj.intrinsicPercentageWidth;
        acc.maxColumnWidth += obj.maxColumnWidth;
        return acc;
    }, {columnMinWidth: 0, intrinsicPercentageWidth: 0, maxColumnWidth: 0});
}

export function getParentColumnId(column, subHeadingDefs) {
    const def = subHeadingDefs.find(({columnId}) => columnId === column); 
    const col = def?.parentId ? def.parentId : undefined;
    return col;
}

export function getChildColumnId(column, subHeadingDefs) {
    const def = subHeadingDefs.find(({parentId}) => parentId === column); 
    const col = def?.columnId ? def.columnId : undefined;
    return col;
}
