import { pushGraphicsState, popGraphicsState, moveTo, lineTo, appendBezierCurve, closePath, clip, endPath } from 'pdf-lib';
import { processData } from "../../lib/dataProcessing.js";

export class VerticalTable {
    constructor(
        //REQUIRED
        data,
        columns,
        page,
        isInitPage,
        options,
        //TABLE
        {
            tableStartingX = 0,
            tableStartingY = 0,
            appendedTableStartingX = undefined,
            appendedTableStartingY = undefined,
            tableDividedX = true,
            tableDividedY = true,
            tableDividerXColor = undefined,
            tableDividerYColor = undefined,
            tableDividerXThickness = 1,
            tableDividerYThickness = 1,
            tableMaxWidth = undefined,
            // maxTableHeight = undefined,
            tableBorder = true,
            tableBorderThickness = 1,
            tableBorderColor = undefined,
            tableBorderRadius = 0,
            continuationFillerHeight = 20,
            headerDividedX = true,       //defaults must match the Header class
            headerDividerXThickness = 1,
        } = {}
    ){
        //REQUIRED
        this._data = data,
        this._columns = columns,
        this._options = options,
        this._page = page,
        //TABLE
        this._startingX = isInitPage ? tableStartingX : appendedTableStartingX,
        this._startingY = isInitPage ? tableStartingY : appendedTableStartingY,
        this._dividedX = tableDividedX,
        this._dividedY = tableDividedY,
        this._dividedXColor = tableDividerXColor,
        this._dividedYColor = tableDividerYColor,
        this._dividedXThickness = tableDividerXThickness,
        this._dividedYThickness = tableDividerYThickness,
        this._maxTableWidth = tableMaxWidth,
        this._maxTableHeight = page.height - (page.height - this._startingY) - continuationFillerHeight - (tableBorder ? tableBorderThickness / 2 : 0),
        this._tableBorder = tableBorder,
        this._tableBorderThickness = tableBorderThickness,
        this._tableBorderColor = tableBorderColor,
        this._tableBorderRadius = tableBorderRadius,
        //the header underline is stroked centered on the header/row boundary, so
        //its bottom half hangs below the header box - rows start below that
        this._headerDividerGap = headerDividedX ? headerDividerXThickness / 2 : 0,
        this._continuationFillerHeight = continuationFillerHeight,
        this._columnDimensions,
        this._columnHeaderHeight,
        this._tableHeight,
        this._finalData,
        this._remainingData,
        this._header,
        this._rows = [],
        this._isInitPage = isInitPage;
        this.init()
    }
    
    init() {
        const [finalColumnDimensions, tableHeight, wrappedTableData, remainingData] = processData(
            this._data,
            this._columns,
            this._maxTableHeight,
            this._options,
            !this._isInitPage //appended pages must always accept at least one row so pagination terminates
        );

        this._columnDimensions = finalColumnDimensions;
        //the border, header, and rows span the columns' summed width - identical
        //to tableMaxWidth in auto mode, narrower when fixed widths don't fill it
        this._effectiveWidth = Object.values(finalColumnDimensions).reduce((acc, col) => acc + col.actualWidth, 0);
        this._tableHeight = tableHeight;
        this._finalData = wrappedTableData;
        this._remainingData = remainingData;
    }
    
    get width() {
        return this._effectiveWidth;
    }
    
    get startingX() {
        return this._startingX;
    }

    get rows() {
        return this._rows
    }

    get columnDimensions() {
        return this._columnDimensions;
    }

    get remainingData() {
        return this._remainingData
    }

    get data () {
        return this._finalData;
    }
    
    setPage(page) {
        this._page = page;
    }
    
    addRow(row) {
        this._rows.push(row)
    }

    addHeader(header) {
        this._header = header;
    }
    
    //table bounds shared by the border and the corner clip
    getTableBounds() {
        const height = this._tableHeight + this._header.height + this._headerDividerGap;
        return {
            x: this._startingX,
            y: this._startingY - height,
            width: this._effectiveWidth,
            height,
            //a radius can never exceed half the shorter side
            radius: Math.max(0, Math.min(this._tableBorderRadius, this._effectiveWidth / 2, height / 2)),
        };
    }

    drawTable() {
        //painted in layers so thick lines are never covered by a later element:
        //all backgrounds first, then dividers and text, then the border on top
        const numberOfRows = this._rows.length;

        const { radius } = this.getTableBounds();
        if(radius > 0) this.pushRoundedClip();

        this._header.drawFill();
        let rowY = this._startingY - this._header.height - this._headerDividerGap;
        this._rows.forEach((row, index) => {
            row.drawRowBackground(rowY, index);
            rowY -= row.height;
        });

        this._header.drawContents();
        rowY = this._startingY - this._header.height - this._headerDividerGap;
        this._rows.forEach((row, index) => {
            row.drawRowContents(rowY, index, numberOfRows === index + 1);
            rowY -= row.height;
        });

        if(radius > 0) this._page.page.pushOperators(popGraphicsState());

        if(this._tableBorder) this.drawBorder();
    }

    //clip all fills/dividers/text to the rounded table shape so square-cornered
    //backgrounds can't poke out through the rounded corners
    pushRoundedClip() {
        const { x, y, width: w, height: h, radius: r } = this.getTableBounds();
        const k = r * 0.5522847498; //cubic-bezier quarter-circle constant

        this._page.page.pushOperators(
            pushGraphicsState(),
            moveTo(x + r, y),
            lineTo(x + w - r, y),
            appendBezierCurve(x + w - r + k, y, x + w, y + r - k, x + w, y + r),
            lineTo(x + w, y + h - r),
            appendBezierCurve(x + w, y + h - r + k, x + w - r + k, y + h, x + w - r, y + h),
            lineTo(x + r, y + h),
            appendBezierCurve(x + r - k, y + h, x, y + h - r + k, x, y + h - r),
            lineTo(x, y + r),
            appendBezierCurve(x, y + r - k, x + r - k, y, x + r, y),
            closePath(),
            clip(),
            endPath(),
        );
    }
    
    drawBorder() {
        //the path sits exactly on the table bounds so the stroke straddles each
        //edge half-in/half-out - the same model as the dividers, which is what
        //the cell padding intrusion math assumes
        const { x, y, width, height, radius } = this.getTableBounds();

        if(radius > 0) {
            //pdf-lib's drawRectangle has no corner radius - stroke a rounded
            //path instead (svg coordinates: origin at the table's TOP-left,
            //y increasing downward)
            const k = radius * 0.5522847498;
            const w = width, h = height, r = radius;
            const path = [
                `M ${r},0`,
                `L ${w - r},0`,
                `C ${w - r + k},0 ${w},${r - k} ${w},${r}`,
                `L ${w},${h - r}`,
                `C ${w},${h - r + k} ${w - r + k},${h} ${w - r},${h}`,
                `L ${r},${h}`,
                `C ${r - k},${h} 0,${h - r + k} 0,${h - r}`,
                `L 0,${r}`,
                `C 0,${r - k} ${r - k},0 ${r},0`,
                'Z',
            ].join(' ');

            this._page.page.drawSvgPath(path, {
                x,
                y: this._startingY,
                borderWidth: this._tableBorderThickness,
                borderColor: this._tableBorderColor,
                borderOpacity: 1,
            });
            return;
        }

        this._page.page.drawRectangle({
            x,
            y,
            width,
            height,
            borderWidth: this._tableBorderThickness,
            borderColor: this._tableBorderColor,
            opacity: 0,
            borderOpacity: 1,
        })
    }
};
