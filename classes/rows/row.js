import { Cell } from '../cells/cell.js';

export class Row {
    constructor(
        page,
        data,
        height,
        columns,
        width,
        columnDimension,
        options,
        {
            tableStartingX = undefined,
            tableDividedX = true, //must match the VerticalTable default
            tableDividerXThickness = 1,
            tableDividerXColor = undefined,
            tableWidth = undefined,
            rowBackgroundColor = undefined, 
            rowBackgroundOpacity = 0.25,
            rowAlternateColor = false,
            rowAlternateColorValue = undefined,
        } = {}
    ){  
        this._page = page,
        this._data = data,
        this._columns = columns,
        this._startingX = tableStartingX,
        this._dividedX = tableDividedX,
        this._dividedXThickness = tableDividerXThickness,
        this._dividedXColor = tableDividerXColor,
        this._tableWidth = tableWidth,
        this._rowBackgroundColor = rowBackgroundColor,
        this._rowBackgroundOpacity = rowBackgroundOpacity,
        this._alternateRowColor = rowAlternateColor,
        this._alternateRowColorValue = rowAlternateColorValue,
        this._height = height,
        this._width = width,
        this._columnDimension = columnDimension,
        this._cells = columns.map((col) => new Cell(page, data[col.columnId], height, col.columnId, this._columnDimension, options, col.align))
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
        if(this._dividedX) this.drawDividerX(startingY, isLast)

        this.cells.map((cell) => {
            cell.drawCell(startingY);
        })
    }

    drawRowBackground(startingY, index) {
        const color = index % 2 !== 0 && this._alternateRowColor ? this._alternateRowColorValue : this._rowBackgroundColor;

        //without a color pdf-lib emits a path with no paint operator, which
        //some renderers draw anyway - skip instead
        if(!color) return;

        this._page.page.drawRectangle({
            x: this._startingX,
            y: startingY - this._height,
            width: this._width,
            height: this._height,
            borderWidth: 0,
            color,
            opacity: this._rowBackgroundOpacity
        });
    }

    drawDividerX(startingY, isLast) {
        if(isLast) return;
        this._page.page.drawLine({
            start: { x: this._startingX, y: startingY - this._height}, //- Math.max(headerHeight, headerFullTextHeight) },
            end: { x: this._startingX + this._width, y: startingY - this._height}, // - Math.max(headerHeight, headerFullTextHeight) },
            thickness: this._dividedXThickness,
            color: this._dividedXColor,
            opacity: 1,
        });
    }
}
