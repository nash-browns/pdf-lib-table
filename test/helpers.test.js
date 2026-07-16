import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
    brakeStringIntoWords,
    getLongestWordFromString,
    fileterObject,
    sumColumnProperties,
    getParentColumnId,
    getChildColumnId,
    getCellPadding,
} from '../lib/index.js';

describe('brakeStringIntoWords', () => {
    test('splits on whitespace', () => {
        assert.deepEqual(brakeStringIntoWords('one two three'), ['one', 'two', 'three']);
    });

    test('splits on additional wrap characters (separators are dropped)', () => {
        assert.deepEqual(brakeStringIntoWords('a-b c', ['-']), ['a', 'b', 'c']);
    });
});

describe('getLongestWordFromString', () => {
    test('returns the longest word', () => {
        assert.equal(getLongestWordFromString('a bb ccc', {}), 'ccc');
    });
});

describe('fileterObject', () => {
    test('keeps entries matching the predicate', () => {
        assert.deepEqual(fileterObject({ a: 1, b: 2, c: 3 }, v => v > 1), { b: 2, c: 3 });
    });
});

describe('sumColumnProperties', () => {
    test('sums each width property across columns', () => {
        const dims = {
            a: { columnMinWidth: 10, intrinsicPercentageWidth: 0.25, maxColumnWidth: 40 },
            b: { columnMinWidth: 20, intrinsicPercentageWidth: 0.75, maxColumnWidth: 60 },
        };
        assert.deepEqual(sumColumnProperties(dims), {
            columnMinWidth: 30,
            intrinsicPercentageWidth: 1,
            maxColumnWidth: 100,
        });
    });
});

describe('subheading column mapping', () => {
    const defs = [
        { columnId: 'type', parentId: 'product' },
        { columnId: 'total', parentId: 'price' },
    ];

    test('getParentColumnId maps a subheading column to its parent', () => {
        assert.equal(getParentColumnId('type', defs), 'product');
        assert.equal(getParentColumnId('missing', defs), undefined);
    });

    test('getChildColumnId maps a parent column to its subheading column', () => {
        assert.equal(getChildColumnId('price', defs), 'total');
        assert.equal(getChildColumnId('serial', defs), undefined);
    });
});

describe('getCellPadding', () => {
    test('defaults include half the table border thickness', () => {
        //base padding 2/1, border on by default at thickness 1 -> +0.5 each
        assert.deepEqual(getCellPadding(), { cellPaddingX: 2.5, cellPaddingY: 1.5 });
    });

    test('padding grows with divider thickness', () => {
        const { cellPaddingX, cellPaddingY } = getCellPadding({
            headerDividedX: true,
            headerDividerXThickness: 4,
            headerDividedY: true,
            headerDividerYThickness: 6,
        }, 'header');
        assert.equal(cellPaddingX, 2 + 3); //half of the 6pt vertical divider
        assert.equal(cellPaddingY, 1 + 2); //half of the 4pt horizontal divider
    });

    test('no lines means base padding only', () => {
        const padding = getCellPadding({
            tableBorder: false,
            tableDividedX: false,
            tableDividedY: false,
        }, 'cell');
        assert.deepEqual(padding, { cellPaddingX: 2, cellPaddingY: 1 });
    });
});
