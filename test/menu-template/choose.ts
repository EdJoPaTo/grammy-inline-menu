import {deepStrictEqual, strictEqual} from 'node:assert';
import {test} from 'node:test';
import {MenuTemplate} from '../../source/menu-template.js';

await test('menu-template choose buttons hidden', async () => {
	const menu = new MenuTemplate('whatever');
	menu.choose('unique', {
		choices: ['Button'],
		hide: () => true,
		do() {
			throw new Error('do not call this function');
		},
	});
	const keyboard = await menu.renderKeyboard(undefined, '/');
	deepStrictEqual(keyboard, []);
});

await test('menu-template choose buttons', async () => {
	const menu = new MenuTemplate('whatever');
	menu.choose('unique', {
		choices: ['Button'],
		do() {
			throw new Error('do not call this function');
		},
	});
	const keyboard = await menu.renderKeyboard(undefined, '/');
	deepStrictEqual(keyboard, [[{
		text: 'Button',
		callback_data: '/unique:Button',
	}]]);
});

await test('menu-template choose action triggers', () => {
	const menu = new MenuTemplate('whatever');
	menu.choose('unique', {
		choices: ['Button'],
		do() {
			throw new Error('do not call this function');
		},
	});

	const actions = [...menu.renderActionHandlers(/^\//)];
	strictEqual(actions.length, 1);
	strictEqual(actions[0]!.trigger.source, '^\\/unique:(.+)$');
});

await test('menu-template choose action hidden', async () => {
	const menu = new MenuTemplate('whatever');
	menu.choose('unique', {
		choices: ['Button'],
		hide: () => true,
		do() {
			throw new Error('do not call this function');
		},
	});

	const actions = [...menu.renderActionHandlers(/^\//)];

	const result = await actions[0]?.doFunction(undefined, '/unique:Button');
	strictEqual(result, '.');
});

await test('menu-template choose action existing button', async () => {
	const menu = new MenuTemplate<string>('whatever');
	menu.choose('unique', {
		choices: ['Button'],
		do(context, key) {
			strictEqual(context, 'bla');
			strictEqual(key, 'Button');
			return 'wow';
		},
	});

	const actions = [...menu.renderActionHandlers(/^\//)];

	const result = await actions[0]?.doFunction('bla', '/unique:Button');
	strictEqual(result, 'wow');
});

await test('menu-template choose action not existing button', async () => {
	const menu = new MenuTemplate('whatever');
	menu.choose('unique', {
		choices: ['Button'],
		do() {
			throw new Error('do not call this function');
		},
	});

	const actions = [...menu.renderActionHandlers(/^\//)];

	const result = await actions[0]?.doFunction(undefined, '/unique:Tree');
	strictEqual(result, '.');
});

await test('menu-template choose action not existing button check disabled', async () => {
	const menu = new MenuTemplate<string>('whatever');
	menu.choose('unique', {
		disableChoiceExistsCheck: true,
		choices: ['Button'],
		do(context, key) {
			strictEqual(context, 'bla');
			strictEqual(key, 'Tree');
			return 'wow';
		},
	});

	const actions = [...menu.renderActionHandlers(/^\//)];

	const result = await actions[0]?.doFunction('bla', '/unique:Tree');
	strictEqual(result, 'wow');
});

await test('menu-template choose with pagnination buttons', async () => {
	const menu = new MenuTemplate('foo');
	menu.choose('unique', {
		columns: 1,
		maxRows: 1,
		choices: ['Button', 'Tree'],
		setPage() {
			throw new Error('dont set the page on rendering buttons');
		},
		do() {
			throw new Error(
				'dont run the do function when pagination is of interest',
			);
		},
	});
	const keyboard = await menu.renderKeyboard(undefined, '/');
	deepStrictEqual(keyboard, [
		[{
			text: 'Button',
			callback_data: '/unique:Button',
		}],
		[
			{
				text: '1',
				callback_data: '/uniqueP:1',
			},
			{
				text: '▶️ 2',
				callback_data: '/uniqueP:2',
			},
		],
	]);
});

await test('menu-template choose set page action', async t => {
	const setPage = t.mock.fn((context: unknown, page: number) => {
		strictEqual(context, 'bla');
		strictEqual(page, 2);
	});

	const menu = new MenuTemplate('foo');
	menu.choose('unique', {
		columns: 1,
		maxRows: 1,
		choices: ['Button', 'Tree'],
		setPage,
		do() {
			throw new Error(
				'dont call the do function when pagination is of interest',
			);
		},
	});
	const actions = [...menu.renderActionHandlers(/^\//)];
	strictEqual(actions.length, 2);
	const pageAction = actions.find(o =>
		o.trigger.source.includes('uniqueP:'),
	)!;
	const result = await pageAction.doFunction('bla', '/uniqueP:2');
	strictEqual(result, '.');
	strictEqual(setPage.mock.callCount(), 1);
});
