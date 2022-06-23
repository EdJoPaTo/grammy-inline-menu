import test from 'ava'

import {MenuLike, Submenu} from '../../source/menu-like.js'

import {MenuMiddleware} from '../../source/menu-middleware.js'
import {ButtonAction} from '../../source/action-hive.js'

const EMPTY_MENU: MenuLike<unknown> = {
	listSubmenus: () => new Set(),
	renderActionHandlers: () => new Set(),
	renderBody: () => 'whatever',
	renderKeyboard: () => [],
}

test('empty tree', t => {
	const tree = new MenuMiddleware('/', EMPTY_MENU).tree()
	t.is(tree, `Menu Tree
menu                          /
`)
})

test('action', t => {
	const action: ButtonAction<unknown> = {
		trigger: /^\/what$/,
		doFunction() {
			throw new Error('dont call me')
		},
	}
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set([]),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	}
	const tree = new MenuMiddleware('/', menu).tree()
	t.is(tree, `Menu Tree
menu                          /
  action                      /what
`)
})

test('submenu', t => {
	const submenu: Submenu<unknown> = {
		action: /submenu\//,
		hide: () => false,
		menu: EMPTY_MENU,
	}
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set([submenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	}
	const tree = new MenuMiddleware('/', menu).tree()
	t.is(tree, `Menu Tree
menu                          /
  menu                        /submenu/
`)
})

test('subsubmenu', t => {
	const subsubmenu: Submenu<unknown> = {
		action: /deep\//,
		hide: () => false,
		menu: EMPTY_MENU,
	}
	const submenuMenu: MenuLike<unknown> = {
		listSubmenus: () => new Set([subsubmenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'submenu',
		renderKeyboard: () => [],
	}
	const submenu: Submenu<unknown> = {
		action: /submenu\//,
		hide: () => false,
		menu: submenuMenu,
	}
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set([submenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	}
	const tree = new MenuMiddleware('/', menu).tree()
	t.is(tree, `Menu Tree
menu                          /
  menu                        /submenu/
    menu                      /submenu/deep/
`)
})

test('action in submenu', t => {
	const action: ButtonAction<unknown> = {
		trigger: /^\/submenu\/what$/,
		doFunction() {
			throw new Error('dont call me')
		},
	}
	const submenuMenu: MenuLike<unknown> = {
		listSubmenus: () => new Set(),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'submenu',
		renderKeyboard: () => [],
	}
	const submenu: Submenu<unknown> = {
		action: /submenu\//,
		hide: () => false,
		menu: submenuMenu,
	}
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set([submenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	}
	const tree = new MenuMiddleware('/', menu).tree()
	t.is(tree, `Menu Tree
menu                          /
  menu                        /submenu/
    action                    /submenu/what
`)
})
