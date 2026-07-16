import { getTextWidth } from "../../lib/index.js";
import {Page} from './page.js'

export class Document {
    constructor
    (
        initialPage,
        pdfDoc,
        fonts,
        colors,
        {
            continuationTextX = undefined,
            continuationTextY = 10,
            continuationFont,
            continuationFontSize = 15,
            continuationFillerHeight,
            continuationText = 'Continues on Next Page',
        } = {}
    ){
        this._initialPage = initialPage,
        this._pdfDoc = pdfDoc,
        this._fonts = fonts,
        this._colors = colors,
        this._continuationTextY = continuationTextY,
        this._continuationTextX = continuationTextX,
        this._continuationFont = continuationFont,
        this._continuationFontSize = continuationFontSize,
        this._continuationsFillerHeight = continuationFillerHeight,
        this._continuationText = continuationText,
        this._pages = [new Page(initialPage)],
        this._tables = []
    }

    get pages() {
        return this._pages;
    }

    get tables() {
        return this._tables;
    }

    addPage(dimensions) {
        const page = this._pdfDoc.addPage(dimensions);
        this._pages.push(new Page(page));

        return this._pages;
    }
    
    addTable(table) {
        this._tables.push(table);
        return this._tables;
    }

    drawVerticalTables() {
        const totalPages = this._pages.length;
        this._pages.forEach((page, i) => {
            this._tables[i].setPage(page)
            this._tables[i].drawTable()
            if(i !== totalPages - 1) this.drawContinuationFooter(page)
        })
    }

    drawHorizontalTables() {
        
    }

    drawContinuationFooter(page) {
        page.page.drawText(this._continuationText, {
            x: this._continuationTextX ? this._continuationTextX : ((page.width - getTextWidth(this._continuationFont, this._continuationFontSize, this._continuationText) ) / 2),
            y: this._continuationTextY,
            font: this._continuationFont,
            size: this._continuationFontSize,
        });
    }
}
