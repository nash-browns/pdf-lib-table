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
            rowHeightSizing = 'auto',
            tableBorder = true,
            tableBorderThickness = 1,
            tableBorderColor = undefined,
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
        this._tableHeight = tableHeight;
        this._finalData = wrappedTableData;
        this._remainingData = remainingData;
    }
    
    get width() {
        return this._maxTableWidth;
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
    
    drawTable() {
        //painted in layers so thick lines are never covered by a later element:
        //all backgrounds first, then dividers and text, then the border on top
        const numberOfRows = this._rows.length;

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

        if(this._tableBorder) this.drawBorder();
    }
    
    drawBorder() {
        //the rectangle path sits exactly on the table bounds so the stroke
        //straddles each edge half-in/half-out - the same model as the dividers,
        //which is what the cell padding intrusion math assumes
        this._page.page.drawRectangle({
            x: this._startingX,
            y: this._startingY - this._tableHeight - this._header.height - this._headerDividerGap,
            width: this._maxTableWidth,
            height: this._tableHeight + this._header.height + this._headerDividerGap,
            borderWidth: this._tableBorderThickness,
            borderColor: this._tableBorderColor,
            opacity: 0,
            borderOpacity: 1,
        })
    }
};
