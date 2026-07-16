export class Page {
    constructor(
        page, 
        {
            dimensions = [792, 612]
        } ={}
    )
    {
        this._page = page,
        this._dimensions = dimensions
        this._width = dimensions[0]
        this._height = dimensions[1]
    }
    
    setDimensions(page) {
        this._page = page
    }

    get page() {
        return this._page
    }
    
    get dimensions() {
        return this._dimensions
    }

    get height() {
        return this._page.getHeight();
    }

    get width() {
        return this._page.getWidth();
    }
}

