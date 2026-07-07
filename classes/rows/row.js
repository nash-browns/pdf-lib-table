import { Cell } from '../cells/cell';

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
            startingX = undefined,
            dividedX = undefined,
            dividedXThickness = 1,
            dividedXColor = undefined,
            tableWidth = undefined,
            rowBackgroundColor = undefined, 
            alternateRowColor = false,
            alternateRowColorValue = undefined,
        } = {}
    ){  
        this._page = page,
        this._data = data,
        this._columns = columns,
        this._startingX = startingX,
        this._dividedX = dividedX,
        this._dividedXThickness = dividedXThickness,
        this._dividedXColor = dividedXColor,
        this._tableWidth = tableWidth,
        this._rowBackgroundColor = rowBackgroundColor,
        this._alternateRowColor = alternateRowColor,
        this._alternateRowColorValue = alternateRowColorValue,
        this._height = height,
        this._width = width,
        this._columnDimension = columnDimension,
        this._cells = columns.map(({columnId}) => new Cell(page, data[columnId], height, columnId, this._columnDimension, options))
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
        this._page.page.drawRectangle({
            x: this._startingX,
            // y: startingY - this._height + this._cellLineHeight - 1.25,
            y: startingY - this._height,
            width: this._width,
            height: this._height,
            borderWidth: 0,
            color: index % 2 !== 0 && this._alternateRowColor ? this._alternateRowColorValue : this._rowBackgroundColor,
            opacity: 0.25
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
