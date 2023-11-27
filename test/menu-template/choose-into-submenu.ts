import {deepStrictEqual, strictEqual, throws} from 'node:assert'
import {test} from 'node:test'
import {MenuTemplate} from '../../source/menu-template.js'

await test('menu-template choose-into-submenu submenu is listed', () => {
	const menu = new MenuTemplate('foo')
	const submenu = new MenuTemplate('bar')
	menu.chooseIntoSubmenu('unique', [], submenu)
	const submenus = [...menu.listSubmenus()]
	strictEqual(submenus.length, 1)
	strictEqual(submenus[0]!.action.source, 'unique:([^/]+)\\/')
})

await test('menu-template choose-into-submenu submenu hidden', async () => {
	const menu = new MenuTemplate('foo')
	const submenu = new MenuTemplate('bar')
	menu.chooseIntoSubmenu('unique', ['Button'], submenu, {
		hide: () => true,
	})
	const submenus = [...menu.listSubmenus()]
	strictEqual(submenus.length, 1)
	const isHidden = await submenus[0]!.hide?.(undefined, '/unique:Button/')
	strictEqual(isHidden, true)
})

await test('menu-template choose-into-submenu submenu not existing hides', async () => {
	const menu = new MenuTemplate('foo')
	const submenu = new MenuTemplate('bar')
	menu.chooseIntoSubmenu('unique', ['Button'], submenu)
	const submenus = [...menu.listSubmenus()]
	strictEqual(submenus.length, 1)
	const isHidden = await submenus[0]!.hide?.(undefined, '/unique:Tree/')
	strictEqual(isHidden, true)
})

await test('menu-template choose-into-submenu submenu not existing check disabled does not hide', async () => {
	const menu = new MenuTemplate('foo')
	const submenu = new MenuTemplate('bar')
	menu.chooseIntoSubmenu('unique', ['Button'], submenu, {
		disableChoiceExistsCheck: true,
	})
	const submenus = [...menu.listSubmenus()]
	strictEqual(submenus.length, 1)
	const isHidden = await submenus[0]!.hide?.(undefined, '/unique:Button/')
	strictEqual(Boolean(isHidden), false)
	strictEqual(isHidden, undefined)
	strictEqual(submenus[0]!.hide, undefined)
})

await test('menu-template choose-into-submenu button hidden', async () => {
	const menu = new MenuTemplate('foo')
	const submenu = new MenuTemplate('bar')
	menu.chooseIntoSubmenu('unique', ['Button'], submenu, {
		hide: () => true,
	})
	const keyboard = await menu.renderKeyboard(undefined, '/')
	deepStrictEqual(keyboard, [])
})

await test('menu-template choose-into-submenu button', async () => {
	const menu = new MenuTemplate('foo')
	const submenu = new MenuTemplate('bar')
	menu.chooseIntoSubmenu('unique', ['Button'], submenu)
	const keyboard = await menu.renderKeyboard(undefined, '/')
	deepStrictEqual(keyboard, [[{
		text: 'Button',
		callback_data: '/unique:Button/',
	}]])
})

await test('menu-template choose-into-submenu two same action codes throws', () => {
	const menu = new MenuTemplate('foo')
	const submenu = new MenuTemplate('bar')
	menu.chooseIntoSubmenu('unique', [], submenu)
	menu.chooseIntoSubmenu('different', [], submenu)
	throws(() => {
		menu.chooseIntoSubmenu('unique', [], submenu)
	}, {
		message: /already a submenu with the action/,
	})
})

await test('menu-template choose-into-submenu with pagnination buttons', async () => {
	const menu = new MenuTemplate('foo')
	const submenu = new MenuTemplate('bar')
	menu.chooseIntoSubmenu('unique', ['Button', 'Tree'], submenu, {
		columns: 1,
		maxRows: 1,
		setPage() {
			throw new Error('dont set the page on rendering buttons')
		},
	})
	const keyboard = await menu.renderKeyboard(undefined, '/')
	deepStrictEqual(keyboard, [
		[{
			text: 'Button',
			callback_data: '/unique:Button/',
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
	])
})

await test('menu-template choose-into-submenu set page action', async t => {
	const menu = new MenuTemplate<string>('foo')
	const submenu = new MenuTemplate('bar')
	const setPage = t.mock.fn((context: string, page: number) => {
		strictEqual(context, 'bla')
		strictEqual(page, 2)
	})
	menu.chooseIntoSubmenu('unique', ['Button', 'Tree'], submenu, {
		columns: 1,
		maxRows: 1,
		setPage,
	})
	const actions = [...menu.renderActionHandlers(/^\//)]
	strictEqual(actions.length, 1)
	const pageAction = actions[0]!
	const result = await pageAction.doFunction('bla', '/uniqueP:2')
	strictEqual(result, '.')
	strictEqual(setPage.mock.callCount(), 1)
})
