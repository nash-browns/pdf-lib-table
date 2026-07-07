//Cached text measurement. Widths come from pdf-lib's widthOfTextAtSize, which reads
//the advance widths of the font actually embedded in the PDF, so numbers match what
//a PDF viewer renders. Caches are keyed on the font object itself (WeakMap), so
//cached widths are released with the document that owns the font.

const fontWidthCache = new WeakMap();

export function measureText(font, size, text) {
    let sizeCache = fontWidthCache.get(font);
    if(!sizeCache) fontWidthCache.set(font, sizeCache = new Map());

    let widthCache = sizeCache.get(size);
    if(!widthCache) sizeCache.set(size, widthCache = new Map());

    let width = widthCache.get(text);
    if(width === undefined) widthCache.set(text, width = font.widthOfTextAtSize(text, size));
    return width;
};

//segmentation caches, one per additionalWrapCharacters array (keyed by reference)
const segmentCaches = new WeakMap();
const defaultSegmentCache = new Map();

function getSegmentCache(additionalWrapCharacters) {
    if(!additionalWrapCharacters || additionalWrapCharacters.length === 0) return defaultSegmentCache;

    let cache = segmentCaches.get(additionalWrapCharacters);
    if(!cache) segmentCaches.set(additionalWrapCharacters, cache = new Map());
    return cache;
};

//breaks a string into words on spaces plus any additional wrap characters.
//returns a cached array - callers must not mutate it
export function segmentText(text, additionalWrapCharacters) {
    const cache = getSegmentCache(additionalWrapCharacters);

    let words = cache.get(text);
    if(!words) {
        words = text.split(' ');
        if(additionalWrapCharacters && additionalWrapCharacters.length !== 0) {
            additionalWrapCharacters.forEach((sym) => {
                words = words.map((word) => word.split(sym));
            });
            words = words.flat(Infinity);
        }
        cache.set(text, words);
    }
    return words;
};

//prepare step: segment the text and measure each word once. word widths include a
//trailing space to match how lines are joined and drawn
export function prepareText(font, size, text, additionalWrapCharacters) {
    const words = segmentText(text, additionalWrapCharacters);
    const widths = words.map((word) => measureText(font, size, word + ' '));
    return { words, widths };
};

//layout step: pure arithmetic over the prepared widths, no font calls
export function wrapText(font, size, maxWidth, text, additionalWrapCharacters) {
    const { words, widths } = prepareText(font, size, text, additionalWrapCharacters);

    const lines = [];
    let currentLine = '';
    let currentLineWidth = 0;

    for (let loop = 0; loop < words.length; loop++) {
        if (currentLine !== '' && currentLineWidth + widths[loop] > maxWidth) {
            //current word overflows the line - start a new one
            lines.push(currentLine);
            currentLine = words[loop];
            currentLineWidth = widths[loop];
        } else {
            currentLine = currentLine !== '' ? currentLine + ' ' + words[loop] : words[loop];
            currentLineWidth += widths[loop];
        }
    }
    lines.push(currentLine);

    return lines;
};

//width of the widest word in the string - the true minimum width a column needs.
//measured, not character-counted: "WWW" is wider than "iiii"
export function getWidestWordWidth(font, size, text, additionalWrapCharacters) {
    const { widths } = prepareText(font, size, text, additionalWrapCharacters);
    return Math.max(...widths);
};

const fontMetricsCache = new WeakMap();

//distance from the bottom of a line box up to the text baseline. pdf-lib's drawText
//positions text by its baseline, and descenders (g, y, p, q, j) hang below it - lifting
//the baseline by the font's descent keeps them inside the line box, and any leftover
//leading is split evenly above and below to vertically center the text
export function getBaselineOffset(font, size, lineHeight) {
    let sizeCache = fontMetricsCache.get(font);
    if(!sizeCache) fontMetricsCache.set(font, sizeCache = new Map());

    let metrics = sizeCache.get(size);
    if(!metrics) {
        const fontHeight = font.heightAtSize(size);
        const descent = fontHeight - font.heightAtSize(size, { descender: false });
        sizeCache.set(size, metrics = { fontHeight, descent });
    }

    return metrics.descent + (lineHeight - metrics.fontHeight) / 2;
};
