import {deepStrictEqual, strictEqual} from 'node:assert';
import {test} from 'node:test';
import {
	getButtonsAsRows,
	getButtonsOfPage,
	getRowsOfButtons,
	maximumButtonsPerPage,
} from './align.js';

function generateCharArray(charA: string, charZ: string): string[] {
	// https://stackoverflow.com/questions/24597634/how-to-generate-an-array-of-alphabet-in-jquery/24597663#24597663
	const a = [];
	let i = charA.codePointAt(0)!;
	const j = charZ.codePointAt(0)!;
	for (; i <= j; ++i) {
		a.push(String.fromCodePoint(i));
	}

	return a;
}

await test('getRowsOfButtons example', () => {
	const result = getRowsOfButtons(generateCharArray('A', 'Z'), 2, 3, 2);
	deepStrictEqual(result, [
		['G', 'H'],
		['I', 'J'],
		['K', 'L'],
	]);
});

await test('getRowsOfButtons example with defaults', () => {
	const result = getRowsOfButtons(generateCharArray('A', 'E'));
	deepStrictEqual(result, [['A', 'B', 'C', 'D', 'E']]);
});

await test('getButtonsAsRows less buttons than columns', () => {
	const result = getButtonsAsRows(generateCharArray('A', 'E'), 6);
	deepStrictEqual(result, [['A', 'B', 'C', 'D', 'E']]);
});

await test('getButtonsAsRows buttons for three colums', () => {
	const result = getButtonsAsRows(generateCharArray('A', 'F'), 2);
	deepStrictEqual(result, [
		['A', 'B'],
		['C', 'D'],
		['E', 'F'],
	]);
});

await test('getButtonsAsRows buttons for three colums but last not full', () => {
	const result = getButtonsAsRows(generateCharArray('A', 'E'), 2);
	deepStrictEqual(result, [['A', 'B'], ['C', 'D'], ['E']]);
});

await test('getButtonsAsRows default columns', () => {
	const result = getButtonsAsRows(generateCharArray('A', 'H'));
	deepStrictEqual(result, [
		['A', 'B', 'C', 'D', 'E', 'F'],
		['G', 'H'],
	]);
});

await test('getButtonsAsRows without buttons', () => {
	const result = getButtonsAsRows([]);
	deepStrictEqual(result, []);
});

await test('getButtonsOfPage default args', () => {
	const result = getButtonsOfPage(generateCharArray('A', 'E'));
	deepStrictEqual(result, ['A', 'B', 'C', 'D', 'E']);
});

await test('getButtonsOfPage without buttons', () => {
	const result = getButtonsOfPage([]);
	deepStrictEqual(result, []);
});

await test('getButtonsOfPage trim by maxRows', () => {
	const result = getButtonsOfPage(generateCharArray('A', 'Z'), 1, 5);
	deepStrictEqual(result, ['A', 'B', 'C', 'D', 'E']);
});

await test('getButtonsOfPage second page', () => {
	const result = getButtonsOfPage(generateCharArray('A', 'Z'), 1, 3, 2);
	deepStrictEqual(result, ['D', 'E', 'F']);
});

await test('getButtonsOfPage partial last page', () => {
	const result = getButtonsOfPage(generateCharArray('A', 'E'), 1, 3, 2);
	deepStrictEqual(result, ['D', 'E']);
});

await test('getButtonsOfPage last possible page instead of wanted', () => {
	const result = getButtonsOfPage(generateCharArray('A', 'F'), 1, 3, 3);
	deepStrictEqual(result, ['D', 'E', 'F']);
});

await test('maximumButtonsPerPage example', () => {
	strictEqual(maximumButtonsPerPage(2, 3), 6);
	strictEqual(maximumButtonsPerPage(4, 4), 16);
});

await test('maximumButtonsPerPage default', () => {
	strictEqual(maximumButtonsPerPage(), 60);
});
