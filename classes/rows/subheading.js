import { SubheadingCell } from "../cells/subheadingCell";

export class SubHeading {
    constructor(
        page,
        data,
        height,
        columns,
        width,
        columnDimension,
        options,
        {
            subHeadingColumns,
            startingX = undefined,
            tableWidth = undefined,
            subHeadingBackgroundColor = undefined,
            subHeadingDividedX = undefined,
            subHeadingDividedXThickness = undefined,
            subHeadingDividedXColor = undefined,
        } = {}
    ){  
        this._page = page,
        this._data = data,
        this._columnIds = columns,
        this._startingX = startingX,
        this._subHeadingDividedX = subHeadingDividedX,
        this._subHeadingDividedXThickness = subHeadingDividedXThickness,
        this._subHeadingDividedXColor = subHeadingDividedXColor,
        this._tableWidth = tableWidth,
        this._subHeadingBackgroundColor = subHeadingBackgroundColor,
        this._height = height,
        this._width = width,
        this._columnDimension = columnDimension,
        this._cells = columns.map(({columnId, parentId}) => new SubheadingCell(page, data[parentId], height, parentId, columns, this._columnDimension, options))
    }

    get cells() {
        return this._cells
    }
    
    get height() {
        return this._height;
    }

    addCell(cell) {
        this._cells.push(cell);
    }

    drawRow(startingY, index, isLast) {
        this.drawRowBackground(startingY, index);
        this.drawRowContents(startingY, index, isLast);

        return this;
    }

    //dividers and text - drawn in a separate pass after ALL row backgrounds, so a
    //thick divider intruding into the next row is never painted over by that
    //row's background
    drawRowContents(startingY, index, isLast) {
        if(this._subHeadingDividedX) this.drawDividerX(startingY, isLast)

        this.cells.map((cell) => {
            cell.drawCell(startingY);
        })
    }

    drawRowBackground(startingY, index) {
        this._page.page.drawRectangle({
            x: this._startingX,
            y: startingY - this._height,
            width: this._width,
            height: this._height,
            borderWidth: 0,
            color: this._subHeadingBackgroundColor,
            opacity: 0.25
        });
    }

    drawDividerX(startingY, isLast) {
        if(isLast) return;
        this._page.page.drawLine({
            start: { x: this._startingX, y: startingY - this._height}, //- Math.max(headerHeight, headerFullTextHeight) },
            end: { x: this._startingX + this._width, y: startingY - this._height}, // - Math.max(headerHeight, headerFullTextHeight) },
            thickness: this._subHeadingDividedXThickness,
            color: this._subHeadingDividedXColor,
            opacity: 1,
        });
    }
}
