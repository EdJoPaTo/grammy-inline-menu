import {deepStrictEqual, strictEqual} from 'node:assert'
import {test} from 'node:test'
import {MenuTemplate} from '../../source/menu-template.js'

await test('menu-template select buttons hidden', async () => {
	const menu = new MenuTemplate('whatever')
	menu.select('unique', ['Button'], {
		hide: () => true,
		isSet() {
			throw new Error('do not call this function when hidden')
		},
		set() {
			throw new Error('do not call this function')
		},
	})
	const keyboard = await menu.renderKeyboard(undefined, '/')
	deepStrictEqual(keyboard, [])
})

await test('menu-template select button true', async t => {
	const menu = new MenuTemplate<string>('whatever')
	const isSet = t.mock.fn((context: string, key: string) => {
		strictEqual(context, 'foo')
		strictEqual(key, 'Button')
		return true
	})
	menu.select('unique', ['Button'], {
		isSet,
		set() {
			throw new Error('do not call this function')
		},
	})
	const keyboard = await menu.renderKeyboard('foo', '/')
	deepStrictEqual(keyboard, [[{
		text: '✅ Button',
		callback_data: '/uniqueF:Button',
	}]])
	strictEqual(isSet.mock.callCount(), 1)
})

await test('menu-template select button false', async t => {
	const menu = new MenuTemplate<string>('whatever')
	const isSet = t.mock.fn((context: string, key: string) => {
		strictEqual(context, 'foo')
		strictEqual(key, 'Button')
		return false
	})
	menu.select('unique', ['Button'], {
		isSet,
		set() {
			throw new Error('do not call this function')
		},
	})
	const keyboard = await menu.renderKeyboard('foo', '/')
	deepStrictEqual(keyboard, [[{
		text: 'Button',
		callback_data: '/uniqueT:Button',
	}]])
	strictEqual(isSet.mock.callCount(), 1)
})

await test('menu-template select button false with emoji', async t => {
	const menu = new MenuTemplate<string>('whatever')
	const isSet = t.mock.fn((context: string, key: string) => {
		strictEqual(context, 'foo')
		strictEqual(key, 'Button')
		return false
	})
	menu.select('unique', ['Button'], {
		showFalseEmoji: true,
		isSet,
		set() {
			throw new Error('do not call this function')
		},
	})
	const keyboard = await menu.renderKeyboard('foo', '/')
	deepStrictEqual(keyboard, [[{
		text: '🚫 Button',
		callback_data: '/uniqueT:Button',
	}]])
	strictEqual(isSet.mock.callCount(), 1)
})

await test('menu-template select action triggers', () => {
	const menu = new MenuTemplate<string>('whatever')
	menu.select('unique', ['Button'], {
		isSet() {
			throw new Error('do not call this function')
		},
		set() {
			throw new Error('do not call this function')
		},
	})

	const actions = [...menu.renderActionHandlers(/^\//)]
	strictEqual(actions.length, 2)

	const triggers = new Set(actions.map(o => o.trigger.source))
	strictEqual(triggers.has('^\\/uniqueT:(.+)$'), true)
	strictEqual(triggers.has('^\\/uniqueF:(.+)$'), true)
})

await test('menu-template select action hidden', async () => {
	const menu = new MenuTemplate<string>('whatever')
	menu.select('unique', ['Button'], {
		hide: () => true,
		isSet() {
			throw new Error('do not call this function')
		},
		set() {
			throw new Error('do not call this function')
		},
	})

	const actions = [...menu.renderActionHandlers(/^\//)]

	const result0 = await actions[0]?.doFunction('foo', '/uniqueT:Button')
	strictEqual(result0, '.')

	const result1 = await actions[1]?.doFunction('foo', '/uniqueF:Button')
	strictEqual(result1, '.')
})

await test('menu-template select action skipped when not existing', async () => {
	const menu = new MenuTemplate<string>('whatever')
	menu.select('unique', ['Button'], {
		isSet() {
			throw new Error('do not call this function')
		},
		set() {
			throw new Error('do not call this function')
		},
	})

	const actions = [...menu.renderActionHandlers(/^\//)]

	const result0 = await actions[0]?.doFunction('foo', '/uniqueT:Tree')
	strictEqual(result0, '.')

	const result1 = await actions[1]?.doFunction('foo', '/uniqueF:Tree')
	strictEqual(result1, '.')
})

await test('menu-template select action true', async t => {
	const menu = new MenuTemplate<string>('whatever')
	const set = t.mock.fn((context: string, key: string, newState: boolean) => {
		strictEqual(context, 'foo')
		strictEqual(key, 'Button')
		strictEqual(newState, true)
		return 'wow'
	})
	menu.select('unique', ['Button'], {
		isSet() {
			throw new Error('do not call this function')
		},
		set,
	})

	const actions = [...menu.renderActionHandlers(/^\//)]
	const action = actions.find(o => o.trigger.source.includes('uniqueT'))!
	const result = await action.doFunction('foo', '/uniqueT:Button')
	strictEqual(result, 'wow')
	strictEqual(set.mock.callCount(), 1)
})

await test('menu-template select action false', async t => {
	const menu = new MenuTemplate<string>('whatever')
	const set = t.mock.fn((context: string, key: string, newState: boolean) => {
		strictEqual(context, 'foo')
		strictEqual(key, 'Button')
		strictEqual(newState, false)
		return 'wow'
	})
	menu.select('unique', ['Button'], {
		isSet() {
			throw new Error('do not call this function')
		},
		set,
	})

	const actions = [...menu.renderActionHandlers(/^\//)]
	const action = actions.find(o => o.trigger.source.includes('uniqueF'))!
	const result = await action.doFunction('foo', '/uniqueF:Button')
	strictEqual(result, 'wow')
	strictEqual(set.mock.callCount(), 1)
})

await test('menu-template select action true not existing check disabled', async t => {
	const menu = new MenuTemplate<string>('whatever')
	const set = t.mock.fn((context: string, key: string, newState: boolean) => {
		strictEqual(context, 'foo')
		strictEqual(key, 'Tree')
		strictEqual(newState, true)
		return 'wow'
	})
	menu.select('unique', ['Button'], {
		disableChoiceExistsCheck: true,
		isSet() {
			throw new Error('do not call this function')
		},
		set,
	})

	const actions = [...menu.renderActionHandlers(/^\//)]
	const action = actions.find(o => o.trigger.source.includes('uniqueT'))!
	const result = await action.doFunction('foo', '/uniqueT:Tree')
	strictEqual(result, 'wow')
	strictEqual(set.mock.callCount(), 1)
})

await test('menu-template select with pagnination buttons', async () => {
	const menu = new MenuTemplate<string>('foo')
	menu.select('unique', ['Button', 'Tree'], {
		columns: 1,
		maxRows: 1,
		setPage() {
			throw new Error('dont set the page on rendering buttons')
		},
		isSet(context, key) {
			strictEqual(context, 'foo')
			strictEqual(key, 'Button')
			return false
		},
		set() {
			throw new Error('do not call this function')
		},
	})
	const keyboard = await menu.renderKeyboard('foo', '/')
	deepStrictEqual(keyboard, [
		[{
			text: 'Button',
			callback_data: '/uniqueT:Button',
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

await test('menu-template select set page action', async t => {
	const menu = new MenuTemplate('foo')
	const setPage = t.mock.fn((context: unknown, page: number) => {
		strictEqual(context, 'bla')
		strictEqual(page, 2)
	})
	menu.select('unique', ['Button', 'Tree'], {
		columns: 1,
		maxRows: 1,
		setPage,
		isSet() {
			throw new Error('do not call this function')
		},
		set() {
			throw new Error('do not call this function')
		},
	})
	const actions = [...menu.renderActionHandlers(/^\//)]
	strictEqual(actions.length, 3)
	const pageAction = actions.find(o => o.trigger.source.includes('uniqueP:'))!
	const result = await pageAction.doFunction('bla', '/uniqueP:2')
	strictEqual(result, '.')
	strictEqual(setPage.mock.callCount(), 1)
})
