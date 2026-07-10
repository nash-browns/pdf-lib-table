import { getBaselineOffset, getCellPadding, getTextWidth } from '../../lib/index.js';

export class Cell {
    constructor(
        page,
        data,
        height,
        columnId,
        columnDimension,
        options = {},
        align = 'left' //'left' | 'center' | 'right' - from the column definition
    ){
        const {
            tableStartingX,
            cellFont,
            cellTextColor,
            cellTextSize = 10,
            cellLineHeight = cellTextSize,
            tableDividedY = true, //must match the VerticalTable default
            tableDividerYThickness,
            tableDividerYColor,
        } = options;
        const { cellPaddingX, cellPaddingY } = getCellPadding(options);

        this._page = page,
        this._data = data,
        this._columnId = columnId,
        this._columnDimensions = columnDimension,
        this._startingX = columnDimension[columnId].startingX,
        this._tableStartingX = tableStartingX,
        this._height = height,
        this._cellFont = cellFont,
        this._cellTextColor = cellTextColor,
        this._cellTextSize = cellTextSize,
        this._cellLineHeight = cellLineHeight,
        this._dividedY = tableDividedY,
        this._dividedYThickness = tableDividerYThickness,
        this._dividedYColor = tableDividerYColor,
        this._cellPaddingX = cellPaddingX,
        this._cellPaddingY = cellPaddingY,
        this._align = align
    }

    drawCell(startingY) {
        if(this._dividedY && this._startingX !== this._tableStartingX) this.drawDividerY(startingY);
        this.drawCellText(startingY);
    }

    drawDividerY(startingY) {
        this._page.page.drawLine({
            start: { x: this._startingX, y: startingY},
            end: { x: this._startingX, y: startingY - this._height},
            thickness: this._dividedYThickness,
            color: this._dividedYColor,
            opacity: 0.75,
        }); 
    }

    drawCellText(startingY) {
        const baselineOffset = getBaselineOffset(this._cellFont, this._cellTextSize, this._cellLineHeight);

        const availableWidth = this._columnDimensions[this._columnId].actualWidth - (this._cellPaddingX * 2);

        this._data.forEach((text, i) => {
            const alignment = this._align === 'center' ?
                (availableWidth - getTextWidth(this._cellFont, this._cellTextSize, text)) / 2 :
                this._align === 'right' ?
                availableWidth - getTextWidth(this._cellFont, this._cellTextSize, text) :
                0;

            this._page.page.drawText(text, {
                x: this._startingX + this._cellPaddingX + alignment,
                y: startingY - this._cellPaddingY - (this._cellLineHeight * (i + 1)) + baselineOffset,
                font: this._cellFont,
                size: this._cellTextSize,
                lineHeight: this._cellLineHeight,
                color: this._cellTextColor
            });
        })
    }
}
