import { wrapHeader } from "../../lib/headerDimensions/index.js";
import { getTextWidth, getBaselineOffset, getCellPadding } from "../../lib/index.js";

export class Header {
    constructor(
        page, 
        columns,
        columnWidths,
        tableWidth,
        isInitPage,
        options,
        {
            tableStartingX = undefined,
            tableStartingY = undefined,
            headerHeight = undefined,
            appendedTableStartingX = undefined,
            appendedTableStartingY = undefined,
            headerBackgroundColor = undefined,
            headerBackgroundOpacity = 0.25,
            headerWrapText = true,
            headerFont = undefined,
            headerTextSize = 12,
            headerTextColor = undefined,
            headerTextAlignment = 'left',
            headerTextJustification = 'center',
            headerDividedX = true,
            headerDividedY = true,
            headerDividerXColor = undefined,
            headerDividerYColor = undefined,
            headerDividerXThickness = 1,
            headerDividerYThickness = 1
        } ={},
    ){
        this._page = page,
        this._columns = columns,
        this._columnWidths = columnWidths,
        this._tableWidth = tableWidth,
        this._options = options,
        this._startingX = isInitPage ? tableStartingX : appendedTableStartingX,
        this._startingY = isInitPage ? tableStartingY : appendedTableStartingY,
        this._headerMinHeight = headerHeight,
        this._headerBackgroundColor = headerBackgroundColor,
        this._headerBackgroundOpacity = headerBackgroundOpacity,
        this._headerWrapText = headerWrapText,
        this._headerFont = headerFont,
        this._headerTextSize = headerTextSize,
        this._headerTextColor = headerTextColor,
        this._headerTextAlignment = headerTextAlignment,
        this._headerTextJustification = headerTextJustification,
        this._headerDividedX = headerDividedX,
        this._headerDividedY = headerDividedY,
        this._headerDividedXColor = headerDividerXColor,
        this._headerDividedYColor = headerDividerYColor,
        this._headerDividedXThickness = headerDividerXThickness,
        this._headerDividedYThickness = headerDividerYThickness,
        this._height,
        this._wrappedHeaders,
        this.init()
    }

    init()  {
        this.getHeight();
    }

    get height () {
        return this._height;
    }
    
    getHeight() {
        const { additionalWrapCharacters } = this._options;
        const { cellPaddingX, cellPaddingY } = getCellPadding(this._options, 'header');

        this._wrappedHeaders = wrapHeader({ columns: this._columns, columnDimensions: this._columnWidths, headerTextSize: this._headerTextSize, headerFont: this._headerFont, additionalWrapCharacters, cellPaddingX, cellPaddingY });
        //headerHeight acts as a minimum - the header still grows to fit wrapped text
        this._height = Math.max(...this._wrappedHeaders.map(({ height }) => height), this._headerMinHeight ?? 0);

        return this._height;
    }

    drawHeader(tableWidth) {
        this.drawFill(tableWidth);
        this.drawContents();
    };

    //dividers and text - drawn after all backgrounds (see VerticalTable.drawTable)
    drawContents() {
        if(this._headerDividedX) this.drawDividerX();
        if(this._headerDividedY) this.drawDividerY();
        this.drawHeadings();
    };

    drawFill() {
        //without a color pdf-lib emits a path with no paint operator, which
        //some renderers draw anyway - skip instead
        if(!this._headerBackgroundColor) return;

        this._page.page.drawRectangle({
            x: this._startingX,
            y: this._startingY - this.getHeight(), //Math.max(headerHeight, headerFullTextHeight),
            width: this._tableWidth,
            height: this._height, //Math.max(headerHeight, headerFullTextHeight),
            borderWidth: 0,
            color: this._headerBackgroundColor,
            opacity: this._headerBackgroundOpacity
        });
    }

    drawDividerX() {
        this._page.page.drawLine({
            start: { x: this._startingX, y: this._startingY - this._height}, //- Math.max(headerHeight, headerFullTextHeight) },
            end: { x: this._startingX + this._tableWidth, y: this._startingY - this._height}, // - Math.max(headerHeight, headerFullTextHeight) },
            thickness: this._headerDividedXThickness,
            color: this._headerDividedXColor,
            opacity: 1,
        });
    }

    drawDividerY() {
        let counter = 0
        const numberOfColumns = Object.keys(this._columnWidths).length;
        Object.keys(this._columnWidths).forEach((col, i) => {
            if(numberOfColumns - 1 == i) return;

            const dividerX = i == 0 ? this._columnWidths[col].actualWidth : this._columnWidths[col].actualWidth + counter;
            this._page.page.drawLine({
                start: { x: this._startingX + dividerX, y: this._startingY },
                end: { x: this._startingX + dividerX, y: this._startingY - this._height}, //Math.max(headerHeight, headerFullTextHeight) },
                thickness: this._headerDividedYThickness,
                color: this._headerDividedYColor,
                opacity: 0.75,
            });

            counter += this._columnWidths[col].actualWidth;
        })
    }

    drawHeadings() {
        const { cellPaddingX, cellPaddingY } = getCellPadding(this._options, 'header');
        let horizontalCursor = 0;
        this._wrappedHeaders.forEach(({ columnId, data, height }) => {
            const textHeight = data.length * this._headerTextSize;

            const justification = this._headerTextJustification === 'center' ?
            (this._height - textHeight) / 2 :
            this._headerTextJustification === 'bottom' ?
            this._height - textHeight - cellPaddingY :
            cellPaddingY;

            data.forEach((textLines, i) => {
                const availableWidth = this._columnWidths[columnId].actualWidth - (cellPaddingX * 2);
                const alignment = cellPaddingX + (this._headerTextAlignment === 'center' ?
                (availableWidth - getTextWidth(this._headerFont, this._headerTextSize, textLines)) / 2 :
                this._headerTextAlignment === 'right' ?  availableWidth - getTextWidth(this._headerFont, this._headerTextSize, textLines) :
                0)

                this._page.page.drawText(textLines, {
                    x: this._startingX + alignment + horizontalCursor,
                    y: this._startingY - justification - (this._headerTextSize * (i + 1)) + getBaselineOffset(this._headerFont, this._headerTextSize, this._headerTextSize),
                    size: this._headerTextSize,
                    font: this._headerFont,
                    color: this._headerTextColor,
                    lineHeight: this._headerTextSize
                });
            })
            horizontalCursor += this._columnWidths[columnId].actualWidth;
        });
    }
};
