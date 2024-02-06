import {deepStrictEqual, strictEqual} from 'node:assert';
import {test} from 'node:test';
import {generateChoicesButtons} from './buttons.js';

await test('choice buttons empty choices no buttons', async () => {
	const func = generateChoicesButtons('pre', false, {choices: []});
	const buttons = await func(undefined, '/');
	deepStrictEqual(buttons, []);
});

await test('choice buttons single choice one button', async () => {
	const func = generateChoicesButtons('pre', false, {choices: ['a']});
	const buttons = await func(undefined, '/');
	deepStrictEqual(buttons, [[{
		text: 'a',
		relativePath: 'pre:a',
	}]]);
});

await test('choice buttons single choice into submenu', async () => {
	const func = generateChoicesButtons('pre', true, {choices: ['a']});
	const buttons = await func(undefined, '/');
	deepStrictEqual(buttons, [[{
		text: 'a',
		relativePath: 'pre:a/',
	}]]);
});

await test('choice buttons creates pagination buttons', async () => {
	const func = generateChoicesButtons('pre', false, {
		columns: 1,
		maxRows: 1,
		choices: ['a', 'b', 'c'],
		setPage() {
			throw new Error('no need to call setPage on keyboard creation');
		},
	});
	const buttons = await func(undefined, '/');
	deepStrictEqual(buttons, [
		[{
			text: 'a',
			relativePath: 'pre:a',
		}],
		[{
			text: '1',
			relativePath: 'preP:1',
		}, {
			text: '▶️ 2',
			relativePath: 'preP:2',
		}, {
			text: '⏩ 3',
			relativePath: 'preP:3',
		}],
	]);
});

await test('choice buttons show keys of page 2', async () => {
	const func = generateChoicesButtons('pre', false, {
		columns: 1,
		maxRows: 1,
		choices: ['a', 'b', 'c'],
		getCurrentPage: () => 2,
	});
	const buttons = await func(undefined, '/');
	deepStrictEqual(buttons, [[{
		text: 'b',
		relativePath: 'pre:b',
	}]]);
});

await test('choice buttons choice function is run', async t => {
	const choiceFunction = t.mock.fn((context: string) => [context]);
	const func = generateChoicesButtons('pre', false, {
		choices: choiceFunction,
	});
	deepStrictEqual(await func('a', '/'), [[{
		text: 'a',
		relativePath: 'pre:a',
	}]]);
	deepStrictEqual(await func('b', '/'), [[{
		text: 'b',
		relativePath: 'pre:b',
	}]]);
	strictEqual(choiceFunction.mock.callCount(), 2);
});

await test('choice buttons choice can have text by itself', async () => {
	const func = generateChoicesButtons('pre', false, {choices: {a: 'Aaa'}});
	const buttons = await func(undefined, '/');
	deepStrictEqual(buttons, [[{
		text: 'Aaa',
		relativePath: 'pre:a',
	}]]);
});

await test('choice buttons choice buttonText is used', async () => {
	const func = generateChoicesButtons('pre', false, {
		buttonText: () => 'Aaa',
		choices: ['a'],
	});
	const buttons = await func(undefined, '/');
	deepStrictEqual(buttons, [[{
		text: 'Aaa',
		relativePath: 'pre:a',
	}]]);
});

await test('choice buttons hidden does not render any buttons', async () => {
	const choiceFunction = (): never => {
		throw new Error('hidden -> dont call choices');
	};

	const func = generateChoicesButtons('pre', false, {
		choices: choiceFunction,
		hide(context, path) {
			strictEqual(context, undefined);
			strictEqual(path, '/');
			return true;
		},
	});
	const buttons = await func(undefined, '/');
	deepStrictEqual(buttons, []);
});
