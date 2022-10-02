import {Bot} from 'grammy'
import test from 'ava'
import type {Context as BaseContext} from 'grammy'

import type {MenuLike, Submenu} from '../../source/menu-like.js'

import {MenuMiddleware} from '../../source/menu-middleware.js'

// TODO: Ugly workaround. This library should know better...
type MyContext = BaseContext & {match: RegExpExecArray | undefined}

test('root path responds main menu', async t => {
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

	const mm = new MenuMiddleware('/', menu, {
		async sendMenu(menu, _context, path) {
			t.is(menu.listSubmenus().size, 1)
			t.is(path, '/')
		},
	})

	const bot = new Bot<MyContext>('123:ABC');
	(bot as any).botInfo = {}
	bot.use(async (ctx, next) => {
		ctx.reply = () => {
			throw new Error('Use sendMenu instead')
		}

		ctx.answerCallbackQuery = async () => {
			t.pass()
			return true
		}

		return next()
	})

	bot.use(mm.middleware())

	bot.use(() => {
		t.fail()
	})

	await bot.handleUpdate({
		update_id: 666,
		callback_query: {
			id: '666',
			from: {} as any,
			chat_instance: '666',
			data: '/',
		},
	})
})

test('submenu path responds submenu when not hidden', async t => {
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

	const mm = new MenuMiddleware('/', menu, {
		async sendMenu(menu, _context, path) {
			t.is(menu.listSubmenus().size, 0)
			t.is(path, '/submenu/')
		},
	})

	const bot = new Bot<MyContext>('123:ABC');
	(bot as any).botInfo = {}
	bot.use(async (ctx, next) => {
		ctx.reply = () => {
			throw new Error('Use sendMenu instead')
		}

		ctx.answerCallbackQuery = async () => {
			t.pass()
			return true
		}

		return next()
	})

	bot.use(mm.middleware())

	bot.use(() => {
		t.fail()
	})

	await bot.handleUpdate({
		update_id: 666,
		callback_query: {
			id: '666',
			from: {} as any,
			chat_instance: '666',
			data: '/submenu/',
		},
	})
})

test('submenu path responds submenu when no hide function', async t => {
	const submenuMenu: MenuLike<unknown> = {
		listSubmenus: () => new Set(),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'submenu',
		renderKeyboard: () => [],
	}
	const submenu: Submenu<unknown> = {
		action: /submenu\//,
		hide: undefined,
		menu: submenuMenu,
	}
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set([submenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	}

	const mm = new MenuMiddleware('/', menu, {
		async sendMenu(menu, _context, path) {
			t.is(menu.listSubmenus().size, 0)
			t.is(path, '/submenu/')
		},
	})

	const bot = new Bot<MyContext>('123:ABC');
	(bot as any).botInfo = {}
	bot.use(async (ctx, next) => {
		ctx.reply = () => {
			throw new Error('Use sendMenu instead')
		}

		ctx.answerCallbackQuery = async () => {
			t.pass()
			return true
		}

		return next()
	})

	bot.use(mm.middleware())

	bot.use(() => {
		t.fail()
	})

	await bot.handleUpdate({
		update_id: 666,
		callback_query: {
			id: '666',
			from: {} as any,
			chat_instance: '666',
			data: '/submenu/',
		},
	})
})

test('submenu path responds main menu when hidden', async t => {
	const submenuMenu: MenuLike<unknown> = {
		listSubmenus: () => new Set(),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'submenu',
		renderKeyboard: () => [],
	}
	const submenu: Submenu<unknown> = {
		action: /submenu\//,
		hide: () => true,
		menu: submenuMenu,
	}
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set([submenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	}

	const mm = new MenuMiddleware('/', menu, {
		async sendMenu(menu, _context, path) {
			t.is(menu.listSubmenus().size, 1)
			t.is(path, '/')
		},
	})

	const bot = new Bot<MyContext>('123:ABC');
	(bot as any).botInfo = {}
	bot.use(async (ctx, next) => {
		ctx.reply = () => {
			throw new Error('Use sendMenu instead')
		}

		ctx.answerCallbackQuery = async () => {
			t.pass()
			return true
		}

		return next()
	})

	bot.use(mm.middleware())

	bot.use(() => {
		t.fail()
	})

	await bot.handleUpdate({
		update_id: 666,
		callback_query: {
			id: '666',
			from: {} as any,
			chat_instance: '666',
			data: '/submenu/',
		},
	})
})
