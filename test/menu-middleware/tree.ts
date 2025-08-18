import {strictEqual} from 'node:assert';
import {test} from 'node:test';
import type {ButtonAction} from '../../source/action-hive.ts';
import type {MenuLike, Submenu} from '../../source/menu-like.ts';
import {MenuMiddleware} from '../../source/menu-middleware.ts';

const EMPTY_MENU: MenuLike<unknown> = {
	listSubmenus: () => new Set(),
	renderActionHandlers: () => new Set(),
	renderBody: () => 'whatever',
	renderKeyboard: () => [],
};

await test('menu-middleware tree empty', () => {
	const tree = new MenuMiddleware('/', EMPTY_MENU).tree();
	const expected = `Menu Tree
menu                          /
`;
	strictEqual(tree, expected);
});

await test('menu-middleware tree action', () => {
	const action: ButtonAction<unknown> = {
		trigger: /^\/what$/,
		doFunction() {
			throw new Error('dont call me');
		},
	};
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set([]),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	};
	const tree = new MenuMiddleware('/', menu).tree();
	const expected = `Menu Tree
menu                          /
  action                      /what
`;
	strictEqual(tree, expected);
});

await test('menu-middleware tree submenu', () => {
	const submenu: Submenu<unknown> = {
		trigger: /submenu\//,
		hide: () => false,
		menu: EMPTY_MENU,
	};
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set([submenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	};
	const tree = new MenuMiddleware('/', menu).tree();
	const expected = `Menu Tree
menu                          /
  menu                        /submenu/
`;
	strictEqual(tree, expected);
});

await test('menu-middleware tree subsubmenu', () => {
	const subsubmenu: Submenu<unknown> = {
		trigger: /deep\//,
		hide: () => false,
		menu: EMPTY_MENU,
	};
	const submenuMenu: MenuLike<unknown> = {
		listSubmenus: () => new Set([subsubmenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'submenu',
		renderKeyboard: () => [],
	};
	const submenu: Submenu<unknown> = {
		trigger: /submenu\//,
		hide: () => false,
		menu: submenuMenu,
	};
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set([submenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	};
	const tree = new MenuMiddleware('/', menu).tree();
	const expected = `Menu Tree
menu                          /
  menu                        /submenu/
    menu                      /submenu/deep/
`;
	strictEqual(tree, expected);
});

await test('menu-middleware tree action in submenu', () => {
	const action: ButtonAction<unknown> = {
		trigger: /^\/submenu\/what$/,
		doFunction() {
			throw new Error('dont call me');
		},
	};
	const submenuMenu: MenuLike<unknown> = {
		listSubmenus: () => new Set(),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'submenu',
		renderKeyboard: () => [],
	};
	const submenu: Submenu<unknown> = {
		trigger: /submenu\//,
		hide: () => false,
		menu: submenuMenu,
	};
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set([submenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	};
	const tree = new MenuMiddleware('/', menu).tree();
	const expected = `Menu Tree
menu                          /
  menu                        /submenu/
    action                    /submenu/what
`;
	strictEqual(tree, expected);
});
