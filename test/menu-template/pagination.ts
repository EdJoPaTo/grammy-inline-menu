import test from 'ava'

import {MenuTemplate} from '../../source/menu-template'

test('buttons hidden', async t => {
	const menu = new MenuTemplate('whatever')
	menu.pagination('unique', {
		hide: () => true,
		getCurrentPage: () => {
			t.fail('do not call this function when hidden')
			throw new Error('do not call this function when hidden')
		},
		getTotalPages: () => {
			t.fail('do not call this function when hidden')
			throw new Error('do not call this function when hidden')
		},
		setPage: () => {
			t.fail('do not call this function')
		}
	})
	const keyboard = await menu.renderKeyboard(undefined, '/')
	t.deepEqual(keyboard, [])
})

test('action hidden', async t => {
	const menu = new MenuTemplate('whatever')
	menu.pagination('unique', {
		hide: () => true,
		getCurrentPage: () => {
			t.fail('do not call this function when hidden')
			throw new Error('do not call this function when hidden')
		},
		getTotalPages: () => {
			t.fail('do not call this function when hidden')
			throw new Error('do not call this function when hidden')
		},
		setPage: () => {
			t.fail('do not call this function')
		}
	})
	const actions = [...menu.renderActionHandlers(/^\//)]
	t.is(actions.length, 1)

	const result = await actions[0].doFunction('foo', '/unique:1')
	t.is(result, '.')
})

test('buttons 2 pages', async t => {
	const menu = new MenuTemplate<string>('whatever')
	menu.pagination('unique', {
		getCurrentPage: context => {
			t.is(context, 'foo')
			return 1
		},
		getTotalPages: context => {
			t.is(context, 'foo')
			return 2
		},
		setPage: () => {
			t.fail('do not call this function')
		}
	})
	const keyboard = await menu.renderKeyboard('foo', '/')
	t.deepEqual(keyboard, [[
		{
			text: '1',
			callback_data: '/unique:1'
		},
		{
			text: '▶️ 2',
			callback_data: '/unique:2'
		}
	]])
})

test('action trigger', t => {
	const menu = new MenuTemplate('whatever')
	menu.pagination('unique', {
		getCurrentPage: () => {
			t.fail('do not call this function')
			throw new Error('do not call this function')
		},
		getTotalPages: () => {
			t.fail('do not call this function')
			throw new Error('do not call this function')
		},
		setPage: () => {
			t.fail('do not call this function')
		}
	})
	const actions = [...menu.renderActionHandlers(/^\//)]
	t.is(actions.length, 1)

	t.is(actions[0].trigger.source, '^\\/unique:(.+)$')
})

test('action sets page', async t => {
	const menu = new MenuTemplate<string>('whatever')
	menu.pagination('unique', {
		getCurrentPage: () => {
			t.fail('do not call this function')
			throw new Error('do not call this function')
		},
		getTotalPages: () => {
			t.fail('do not call this function')
			throw new Error('do not call this function')
		},
		setPage: (context, page) => {
			t.is(context, 'foo')
			t.is(page, 2)
		}
	})
	const actions = [...menu.renderActionHandlers(/^\//)]
	t.is(actions.length, 1)

	const result = await actions[0].doFunction('foo', '/unique:2')
	t.is(result, '.')

	t.is(actions[0].trigger.source, '^\\/unique:(.+)$')
})
