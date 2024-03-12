import {deepStrictEqual, strictEqual, throws} from 'node:assert';
import {test} from 'node:test';
import {MenuTemplate} from '../../source/menu-template.js';

await test('menu-template submenu is listed', () => {
	const menu = new MenuTemplate('foo');
	const submenu = new MenuTemplate('bar');
	menu.submenu('unique', submenu, {text: 'Button'});
	const submenus = [...menu.listSubmenus()];
	strictEqual(submenus.length, 1);
	strictEqual(submenus[0]!.trigger.source, 'unique\\/');
});

await test('menu-template submenu button hidden', async () => {
	const menu = new MenuTemplate('foo');
	const submenu = new MenuTemplate('bar');
	menu.submenu('unique', submenu, {
		text: 'Button',
		hide: () => true,
	});
	const keyboard = await menu.renderKeyboard(undefined, '/');
	deepStrictEqual(keyboard, []);
});

await test('menu-template submenu button', async () => {
	const menu = new MenuTemplate('foo');
	const submenu = new MenuTemplate('bar');
	menu.submenu('unique', submenu, {text: 'Button'});
	const keyboard = await menu.renderKeyboard(undefined, '/');
	deepStrictEqual(keyboard, [[{
		text: 'Button',
		callback_data: '/unique/',
	}]]);
});

await test('menu-template submenu two same unique identifier codes throws', () => {
	const menu = new MenuTemplate('foo');
	const submenu = new MenuTemplate('bar');
	menu.submenu('unique', submenu, {text: 'Button'});
	menu.submenu('different', submenu, {text: 'Button'});
	throws(() => {
		menu.submenu('unique', submenu, {text: 'Button'});
	}, {
		message: /already a submenu with the unique identifier/,
	});
});
