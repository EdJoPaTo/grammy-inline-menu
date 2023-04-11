import test from 'ava'
import type {Context as BaseContext} from 'grammy'
import type {MenuLike, Submenu} from '../../source/menu-like.js'
import {MenuMiddleware} from '../../source/menu-middleware.js'

test('replies main menu', async t => {
	t.plan(2)
	const submenuMenu: MenuLike<unknown> = {
		listSubmenus: () => new Set(),
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

	const mm = new MenuMiddleware('/', menu)

	const fakeContext: Partial<BaseContext> = {
		async reply(text, other) {
			t.is(text, 'whatever')
			t.deepEqual(other, {
				disable_web_page_preview: false,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return {} as any
		},
	}

	await mm.replyToContext(fakeContext as any)
})

test('replies main menu explicitly', async t => {
	t.plan(2)
	const submenuMenu: MenuLike<unknown> = {
		listSubmenus: () => new Set(),
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

	const mm = new MenuMiddleware('/', menu)

	const fakeContext: Partial<BaseContext> = {
		async reply(text, other) {
			t.is(text, 'whatever')
			t.deepEqual(other, {
				disable_web_page_preview: false,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return {} as any
		},
	}

	await mm.replyToContext(fakeContext as any, '/')
})

test('replies submenu', async t => {
	t.plan(2)
	const submenuMenu: MenuLike<unknown> = {
		listSubmenus: () => new Set(),
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

	const mm = new MenuMiddleware('/', menu)

	const fakeContext: Partial<BaseContext> = {
		async reply(text, other) {
			t.is(text, 'submenu')
			t.deepEqual(other, {
				disable_web_page_preview: false,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return {} as any
		},
	}

	await mm.replyToContext(fakeContext as any, '/submenu/')
})

test('fails with out of scope path', async t => {
	const submenuMenu: MenuLike<unknown> = {
		listSubmenus: () => new Set(),
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

	const mm = new MenuMiddleware('/', menu)

	await t.throwsAsync(
		async () => mm.replyToContext({} as any, 'foo/'),
		{message: 'There is no menu which works with your supplied path: foo/'},
	)
})

test('fails when rootTrigger is a regex and path is not explicit', async t => {
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set(),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	}

	const mm = new MenuMiddleware(/^tree(\d+)\//, menu)

	await t.throwsAsync(
		async () => {
			await mm.replyToContext({} as any)
		},
		{
			message: /absolute path explicitly as a string/,
		},
	)
})
