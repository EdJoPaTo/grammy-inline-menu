import {deepStrictEqual, strictEqual} from 'node:assert'
import {test} from 'node:test'
import {MenuTemplate} from '../../source/menu-template.js'

await test('menu-template pagination buttons hidden', async () => {
	const menu = new MenuTemplate('whatever')
	menu.pagination('unique', {
		hide: () => true,
		getCurrentPage() {
			throw new Error('do not call this function when hidden')
		},
		getTotalPages() {
			throw new Error('do not call this function when hidden')
		},
		setPage() {
			throw new Error('do not call this function')
		},
	})
	const keyboard = await menu.renderKeyboard(undefined, '/')
	deepStrictEqual(keyboard, [])
})

await test('menu-template pagination action hidden', async () => {
	const menu = new MenuTemplate('whatever')
	menu.pagination('unique', {
		hide: () => true,
		getCurrentPage() {
			throw new Error('do not call this function when hidden')
		},
		getTotalPages() {
			throw new Error('do not call this function when hidden')
		},
		setPage() {
			throw new Error('do not call this function')
		},
	})
	const actions = [...menu.renderActionHandlers(/^\//)]
	strictEqual(actions.length, 1)

	const result = await actions[0]!.doFunction('foo', '/unique:1')
	strictEqual(result, '.')
})

await test('menu-template pagination buttons 2 pages', async () => {
	const menu = new MenuTemplate<string>('whatever')
	menu.pagination('unique', {
		getCurrentPage(context) {
			strictEqual(context, 'foo')
			return 1
		},
		getTotalPages(context) {
			strictEqual(context, 'foo')
			return 2
		},
		setPage() {
			throw new Error('do not call this function')
		},
	})
	const keyboard = await menu.renderKeyboard('foo', '/')
	deepStrictEqual(keyboard, [[
		{
			text: '1',
			callback_data: '/unique:1',
		},
		{
			text: '▶️ 2',
			callback_data: '/unique:2',
		},
	]])
})

await test('menu-template pagination action trigger', () => {
	const menu = new MenuTemplate('whatever')
	menu.pagination('unique', {
		getCurrentPage() {
			throw new Error('do not call this function')
		},
		getTotalPages() {
			throw new Error('do not call this function')
		},
		setPage() {
			throw new Error('do not call this function')
		},
	})
	const actions = [...menu.renderActionHandlers(/^\//)]
	strictEqual(actions.length, 1)

	strictEqual(actions[0]!.trigger.source, '^\\/unique:(\\d+)$')
})

await test('menu-template pagination action sets page', async t => {
	const errorMessage
		= 'The current status is not relevant when setting the page. Ithis validated when its important anyway.'
	const menu = new MenuTemplate<string>('whatever')
	const setPage = t.mock.fn((context: string, page: number) => {
		strictEqual(context, 'foo')
		strictEqual(page, 2)
	})
	menu.pagination('unique', {
		getCurrentPage() {
			throw new Error(errorMessage)
		},
		getTotalPages() {
			throw new Error(errorMessage)
		},
		setPage,
	})
	const actions = [...menu.renderActionHandlers(/^\//)]
	strictEqual(actions.length, 1)

	const result = await actions[0]!.doFunction('foo', '/unique:2')
	strictEqual(result, '.')
	strictEqual(setPage.mock.callCount(), 1)
})
