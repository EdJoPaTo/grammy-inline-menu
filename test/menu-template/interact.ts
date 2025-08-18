import {deepStrictEqual, strictEqual} from 'node:assert';
import {test} from 'node:test';
import {MenuTemplate} from '../../source/menu-template.js';

await test('menu-template interact button is added to keyboard', async () => {
	const menu = new MenuTemplate('whatever');

	menu.interact('unique', {
		text: 'Button',
		do() {
			throw new Error('do not call this function');
		},
	});

	const keyboard = await menu.renderKeyboard(undefined, '/');
	deepStrictEqual(keyboard, [
		[
			{
				text: 'Button',
				callback_data: '/unique',
			},
		],
	]);
});

await test('menu-template interact button is added to keyboard with text function', async () => {
	const menu = new MenuTemplate('whatever');

	menu.interact('unique', {
		text: () => 'Button',
		do() {
			throw new Error('do not call this function');
		},
	});

	const keyboard = await menu.renderKeyboard(undefined, '/');
	deepStrictEqual(keyboard, [
		[
			{
				text: 'Button',
				callback_data: '/unique',
			},
		],
	]);
});

await test('menu-template interact hidden button is not shown on keyboard', async () => {
	const menu = new MenuTemplate('whatever');

	menu.interact('unique', {
		text: () => 'Button',
		hide: () => true,
		do() {
			throw new Error('do not call this function');
		},
	});

	const keyboard = await menu.renderKeyboard(undefined, '/');
	deepStrictEqual(keyboard, []);
});

await test('menu-template interact action is added with correct trigger', () => {
	const menu = new MenuTemplate('whatever');

	menu.interact('unique', {
		text: 'Button',
		do() {
			throw new Error('do not call this function');
		},
	});

	const actions = menu.renderActionHandlers(/^\//);
	strictEqual(actions.size, 1);

	const action = [...actions][0]!;
	strictEqual(action.trigger.source, String.raw`^\/unique$`);
});

await test('menu-template interact action can be called', async t => {
	const menu = new MenuTemplate('whatever');

	const doFunction = t.mock.fn((context: unknown, path: string) => {
		strictEqual(context, undefined);
		strictEqual(path, '/unique');
		return 'wow';
	});
	menu.interact('unique', {
		text: 'Button',
		do: doFunction,
	});

	const actions = menu.renderActionHandlers(/^\//);
	strictEqual(actions.size, 1);

	const action = [...actions][0]!;
	const result = await action.doFunction(undefined, '/unique');
	strictEqual(result, 'wow');
	strictEqual(doFunction.mock.callCount(), 1);
});

await test('menu-template interact action can not be called when hidden', async () => {
	const menu = new MenuTemplate('whatever');

	menu.interact('unique', {
		text: 'Button',
		hide: () => true,
		do() {
			throw new Error('do not call this function when hidden');
		},
	});

	const actions = menu.renderActionHandlers(/^\//);
	strictEqual(actions.size, 1);

	const action = [...actions][0]!;
	const result = await action.doFunction(undefined, '/unique');
	strictEqual(result, '.');
});
