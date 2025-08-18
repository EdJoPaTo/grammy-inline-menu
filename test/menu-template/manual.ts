import {deepStrictEqual, strictEqual} from 'node:assert';
import {test} from 'node:test';
import {MenuTemplate} from '../../source/menu-template.ts';

await test('menu-template manual', async () => {
	const menu = new MenuTemplate('whatever');
	menu.manual({text: 'Button', url: 'https://edjopato.de'});
	const keyboard = await menu.renderKeyboard(undefined, '/');
	deepStrictEqual(keyboard, [
		[
			{
				text: 'Button',
				url: 'https://edjopato.de',
			},
		],
	]);
});

await test('menu-template manual function', async () => {
	const menu = new MenuTemplate<string>('whatever');
	menu.manual((context, path) => {
		strictEqual(context, 'foo');
		strictEqual(path, '/');
		return {text: 'Button', url: 'https://edjopato.de'};
	});
	const keyboard = await menu.renderKeyboard('foo', '/');
	deepStrictEqual(keyboard, [
		[
			{
				text: 'Button',
				url: 'https://edjopato.de',
			},
		],
	]);
});

await test('menu-template manual hidden', async () => {
	const menu = new MenuTemplate('whatever');
	menu.manual(
		{text: 'Button', url: 'https://edjopato.de'},
		{
			hide: () => true,
		},
	);
	const keyboard = await menu.renderKeyboard(undefined, '/');
	deepStrictEqual(keyboard, []);
});

await test('menu-template manual hidden false', async () => {
	const menu = new MenuTemplate('whatever');
	menu.manual(
		{text: 'Button', url: 'https://edjopato.de'},
		{
			hide: () => false,
		},
	);
	const keyboard = await menu.renderKeyboard(undefined, '/');
	deepStrictEqual(keyboard, [
		[
			{
				text: 'Button',
				url: 'https://edjopato.de',
			},
		],
	]);
});

await test('menu-template manual hidden false function', async () => {
	const menu = new MenuTemplate<string>('whatever');
	menu.manual(
		(context, path) => {
			strictEqual(context, 'foo');
			strictEqual(path, '/');
			return {text: 'Button', url: 'https://edjopato.de'};
		},
		{
			hide: () => false,
		},
	);
	const keyboard = await menu.renderKeyboard('foo', '/');
	deepStrictEqual(keyboard, [
		[
			{
				text: 'Button',
				url: 'https://edjopato.de',
			},
		],
	]);
});

await test('menu-template manualRow empty input no button', async () => {
	const menu = new MenuTemplate('whatever');
	menu.manualRow(() => []);
	const keyboard = await menu.renderKeyboard(undefined, '/');
	deepStrictEqual(keyboard, []);
});

await test('menu-template manualRow buttons end up in keyboard', async () => {
	const menu = new MenuTemplate('whatever');
	menu.manualRow(() => [
		[
			{text: 'Button1', url: 'https://edjopato.de'},
			{text: 'Button2', relativePath: 'foo'},
		],
	]);
	const keyboard = await menu.renderKeyboard(undefined, '/');
	deepStrictEqual(keyboard, [
		[
			{text: 'Button1', url: 'https://edjopato.de'},
			{text: 'Button2', callback_data: '/foo'},
		],
	]);
});

await test('menu-template manualAction trigger', () => {
	const menu = new MenuTemplate('whatever');
	menu.manualAction(/unique:(\d+)$/, () => {
		throw new Error('do not call this function');
	});
	const actions = [...menu.renderActionHandlers(/^\//)];
	strictEqual(actions.length, 1);

	strictEqual(actions[0]!.trigger.source, String.raw`^\/unique:(\d+)$`);
});

await test('menu-template manualAction is triggered', async t => {
	const menu = new MenuTemplate<string>('whatever');

	const action = t.mock.fn((context: string, path: string) => {
		strictEqual(context, 'foo');
		strictEqual(path, '/unique:2');
		return '.';
	});
	menu.manualAction(/unique:(\d+)$/, action);
	const actions = [...menu.renderActionHandlers(/^\//)];
	strictEqual(actions.length, 1);

	const result = await actions[0]!.doFunction('foo', '/unique:2');
	strictEqual(result, '.');
	strictEqual(action.mock.callCount(), 1);
});
