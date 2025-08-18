import {deepStrictEqual} from 'node:assert';
import {test} from 'node:test';
import {createPaginationChoices} from './pagination.js';

await test('pagination', async t => {
	const macro = async (
		title: string,
		totalPages: number,
		currentPage: number,
		expected: readonly number[],
	) =>
		t.test(title, () => {
			const result = createPaginationChoices(totalPages, currentPage);
			const keys = Object.keys(result).map(Number);
			deepStrictEqual(keys, expected);
		});

	await macro('two pages on first page', 2, 1, [1, 2]);
	await macro('two pages on second page', 2, 1, [1, 2]);
	await macro('five pages on first page', 5, 1, [1, 2, 5]);
	await macro('five pages on second page', 5, 2, [1, 2, 3, 5]);
	await macro('five pages on third page', 5, 3, [1, 2, 3, 4, 5]);
	await macro('five pages on fourth page', 5, 4, [1, 3, 4, 5]);
	await macro('five pages on fifth page', 5, 5, [1, 4, 5]);
	await macro('go big', 200, 100, [1, 99, 100, 101, 200]);
	await macro('one page is ommited', 1, 1, []);
	await macro('NaN pages is ommited', Number.NaN, 1, []);
	await macro('currentPage NaN is assumed 1', 2, Number.NaN, [1, 2]);
	await macro(
		'currentPage greater than totalPages is max page',
		10,
		15,
		[1, 9, 10],
	);
	await macro(
		'currentPage Infinity is max page',
		10,
		Number.POSITIVE_INFINITY,
		[1, 9, 10],
	);

	// When there are 19 items / 2 per page there are... 9.5 pages -> 10
	await macro('when totalPages is float use ceil', 9.5, 10, [1, 9, 10]);

	await t.test('five pages all buttons', () => {
		const result = createPaginationChoices(5, 3);
		deepStrictEqual(result, {
			1: '1 ⏪',
			2: '2 ◀️',
			3: '3',
			4: '▶️ 4',
			5: '⏩ 5',
		});
	});

	await t.test(
		'three pages are with +/-1 buttons and not first/last buttons',
		() => {
			const result = createPaginationChoices(3, 2);
			deepStrictEqual(result, {
				1: '1 ◀️',
				2: '2',
				3: '▶️ 3',
			});
		},
	);
});
