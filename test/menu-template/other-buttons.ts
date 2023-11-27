import {deepStrictEqual, strictEqual} from 'node:assert'
import {test} from 'node:test'
import {MenuTemplate} from '../../source/menu-template.js'

await test('menu-template other-buttons url', async () => {
	const menu = new MenuTemplate('whatever')
	menu.url('Button', 'https://edjopato.de')
	const keyboard = await menu.renderKeyboard(undefined, '/')
	deepStrictEqual(keyboard, [[{
		text: 'Button',
		url: 'https://edjopato.de',
	}]])
})

await test('menu-template other-buttons url functions', async () => {
	const menu = new MenuTemplate<string>('whatever')
	menu.url(
		(context, path) => {
			strictEqual(context, 'foo')
			strictEqual(path, '/')
			return 'Button'
		},
		(context, path) => {
			strictEqual(context, 'foo')
			strictEqual(path, '/')
			return 'https://edjopato.de'
		},
	)
	const keyboard = await menu.renderKeyboard('foo', '/')
	deepStrictEqual(keyboard, [[{
		text: 'Button',
		url: 'https://edjopato.de',
	}]])
})

await test('menu-template other-buttons url hidden', async () => {
	const menu = new MenuTemplate('whatever')
	menu.url('Button', 'https://edjopato.de', {
		hide: () => true,
	})
	const keyboard = await menu.renderKeyboard(undefined, '/')
	deepStrictEqual(keyboard, [])
})

await test('menu-template other-buttons switchToChat', async () => {
	const menu = new MenuTemplate('whatever')
	menu.switchToChat('Button', 'bar')
	const keyboard = await menu.renderKeyboard(undefined, '/')
	deepStrictEqual(keyboard, [[{
		text: 'Button',
		switch_inline_query: 'bar',
	}]])
})

await test('menu-template other-buttons switchToChat functions', async () => {
	const menu = new MenuTemplate<string>('whatever')
	menu.switchToChat(
		(context, path) => {
			strictEqual(context, 'foo')
			strictEqual(path, '/')
			return 'Button'
		},
		(context, path) => {
			strictEqual(context, 'foo')
			strictEqual(path, '/')
			return 'bar'
		},
	)
	const keyboard = await menu.renderKeyboard('foo', '/')
	deepStrictEqual(keyboard, [[{
		text: 'Button',
		switch_inline_query: 'bar',
	}]])
})

await test('menu-template other-buttons switchToChat hidden', async () => {
	const menu = new MenuTemplate('whatever')
	menu.switchToChat('Button', 'https://edjopato.de', {
		hide: () => true,
	})
	const keyboard = await menu.renderKeyboard(undefined, '/')
	deepStrictEqual(keyboard, [])
})

await test('menu-template other-buttons switchToCurrentChat', async () => {
	const menu = new MenuTemplate('whatever')
	menu.switchToCurrentChat('Button', 'bar')
	const keyboard = await menu.renderKeyboard(undefined, '/')
	deepStrictEqual(keyboard, [[{
		text: 'Button',
		switch_inline_query_current_chat: 'bar',
	}]])
})

await test('menu-template other-buttons switchToCurrentChat functions', async () => {
	const menu = new MenuTemplate<string>('whatever')
	menu.switchToCurrentChat(
		(context, path) => {
			strictEqual(context, 'foo')
			strictEqual(path, '/')
			return 'Button'
		},
		(context, path) => {
			strictEqual(context, 'foo')
			strictEqual(path, '/')
			return 'bar'
		},
	)
	const keyboard = await menu.renderKeyboard('foo', '/')
	deepStrictEqual(keyboard, [[{
		text: 'Button',
		switch_inline_query_current_chat: 'bar',
	}]])
})

await test('menu-template other-buttons switchToCurrentChat hidden', async () => {
	const menu = new MenuTemplate('whatever')
	menu.switchToCurrentChat('Button', 'https://edjopato.de', {
		hide: () => true,
	})
	const keyboard = await menu.renderKeyboard(undefined, '/')
	deepStrictEqual(keyboard, [])
})
