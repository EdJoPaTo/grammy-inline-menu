import {deepStrictEqual} from 'node:assert';
import {test} from 'node:test';
import {MenuTemplate} from '../../source/menu-template.js';

await test('menu-template navigate hidden', async () => {
	const menu = new MenuTemplate('whatever');
	menu.navigate('..', {
		text: 'Button',
		hide: () => true,
	});
	const keyboard = await menu.renderKeyboard(undefined, '/foo/bar/');
	deepStrictEqual(keyboard, []);
});

await test('menu-template navigate parent menu', async () => {
	const menu = new MenuTemplate('whatever');
	menu.navigate('..', {text: 'Button'});
	const keyboard = await menu.renderKeyboard(undefined, '/foo/bar/');
	deepStrictEqual(keyboard, [
		[
			{
				text: 'Button',
				callback_data: '/foo/',
			},
		],
	]);
});

await test('menu-template navigate root menu', async () => {
	const menu = new MenuTemplate('whatever');
	menu.navigate('/', {text: 'Button'});
	const keyboard = await menu.renderKeyboard(undefined, '/foo/bar/');
	deepStrictEqual(keyboard, [
		[
			{
				text: 'Button',
				callback_data: '/',
			},
		],
	]);
});
