import { sumColumnProperties, fileterObject } from "../index.js";

export function distributeExcessTableWidth(columnDimensions, options){ // more options could be added here
    const { tableMaxWidth } = options;
    const columnTotals = sumColumnProperties(columnDimensions);

    //All columns can take as much space as they need. No wrapping is required
    if(columnTotals.intrinsicPercentageWidth <= 100) {
        return assignFullColumnWidths(columnDimensions, tableMaxWidth, columnTotals);
    }

    //Some column wrapping will occur - the column min widths fit in the table
    if(columnTotals.columnMinWidth <= tableMaxWidth) {
        return assignIntrinsicBasedColumnWidths(columnDimensions, tableMaxWidth, columnTotals);
    }

    //even the minimum column widths don't fit in tableMaxWidth - render every
    //column at its minimum and let the table overflow the requested width,
    //like an HTML table, instead of throwing mid-render
    return assignMinimumColumnWidths(columnDimensions);
};

export function assignMinimumColumnWidths(columnDimensions) {
    let actialWidth = {};

    Object.keys(columnDimensions).forEach((col) => actialWidth[col] = {...columnDimensions[col], actualWidth: columnDimensions[col].columnMinWidth});

    return actialWidth
}


export function assignIntrinsicBasedColumnWidths(columnDimensions, tableMaxWidth, columnTotals) {
    //the measurment will start at the min width then then distrubute excess based on the intrinsicPercentageWidth
    let actialWidth = {};

    const columnsRecivingWidth = fileterObject(columnDimensions, obj => obj.columnMinWidth !== obj.maxColumnWidth);
    const columnsRecivingWidthintrinsicPercentageTotal = Object.values(columnsRecivingWidth).reduce((acc, obj)  => acc + obj.intrinsicPercentageWidth , 0);
    const excessWidth = tableMaxWidth - columnTotals.columnMinWidth;

    Object.keys(columnDimensions).forEach((col) => {
        const { columnMinWidth, intrinsicPercentageWidth, maxColumnWidth } = columnDimensions[col];
        
        if(columnMinWidth == maxColumnWidth) actialWidth[col] = {...columnDimensions[col], actualWidth: columnMinWidth};
        
        if(columnMinWidth != maxColumnWidth) {
            const width = excessWidth * (intrinsicPercentageWidth / columnsRecivingWidthintrinsicPercentageTotal) + columnMinWidth;
            actialWidth[col] = {...columnDimensions[col], actualWidth: width}
        };

    });

    return actialWidth
}

export function assignFullColumnWidths(columnDimensions, tableMaxWidth, columnTotals) {
    //set all columns to there max width. Then give any extra space out evenly
    let actialWidth = {};
    
    const numberofColumns = Object.keys(columnDimensions).length;
    const excessWidth = tableMaxWidth - columnTotals.maxColumnWidth;
    const widthToAddToEachColumn = excessWidth / numberofColumns;

    Object.keys(columnDimensions).forEach((col) => actialWidth[col] = {...columnDimensions[col], actualWidth: columnDimensions[col].maxColumnWidth + widthToAddToEachColumn});

    return actialWidth
}
