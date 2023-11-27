import {deepStrictEqual, strictEqual, throws} from 'node:assert'
import {test} from 'node:test'
import {MenuTemplate} from '../../source/menu-template.js'

await test('menu-template submenu is listed', () => {
	const menu = new MenuTemplate('foo')
	const submenu = new MenuTemplate('bar')
	menu.submenu('Button', 'unique', submenu)
	const submenus = [...menu.listSubmenus()]
	strictEqual(submenus.length, 1)
	strictEqual(submenus[0]!.action.source, 'unique\\/')
})

await test('menu-template submenu button hidden', async () => {
	const menu = new MenuTemplate('foo')
	const submenu = new MenuTemplate('bar')
	menu.submenu('Button', 'unique', submenu, {
		hide: () => true,
	})
	const keyboard = await menu.renderKeyboard(undefined, '/')
	deepStrictEqual(keyboard, [])
})

await test('menu-template submenu button', async () => {
	const menu = new MenuTemplate('foo')
	const submenu = new MenuTemplate('bar')
	menu.submenu('Button', 'unique', submenu)
	const keyboard = await menu.renderKeyboard(undefined, '/')
	deepStrictEqual(keyboard, [[{
		text: 'Button',
		callback_data: '/unique/',
	}]])
})

await test('menu-template submenu two same action codes throws', () => {
	const menu = new MenuTemplate('foo')
	const submenu = new MenuTemplate('bar')
	menu.submenu('Button', 'unique', submenu)
	menu.submenu('Button', 'different', submenu)
	throws(() => {
		menu.submenu('Button', 'unique', submenu)
	}, {
		message: /already a submenu with the action/,
	})
})
