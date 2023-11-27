import {strictEqual} from 'node:assert'
import {test} from 'node:test'
import {Bot, type Context as BaseContext} from 'grammy'
import type {MenuLike, Submenu} from '../../source/menu-like.js'
import {MenuMiddleware} from '../../source/menu-middleware.js'

// TODO: Ugly workaround. This library should know better...
type MyContext = BaseContext & {match: RegExpExecArray | undefined}

await test('menu-middleware submenu respond with main menu on root path', async () => {
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
			strictEqual(menu.listSubmenus().size, 1)
			strictEqual(path, '/')
		},
	})

	const bot = new Bot<MyContext>('123:ABC');
	(bot as any).botInfo = {}
	bot.use(async (ctx, next) => {
		ctx.reply = () => {
			throw new Error('Use sendMenu instead')
		}

		ctx.answerCallbackQuery = async () => true
		return next()
	})
	bot.use(mm.middleware())
	bot.use(() => {
		throw new Error('dont call this function')
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

await test('menu-middleware submenu respond with submenu when not hidden', async () => {
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
			strictEqual(menu.listSubmenus().size, 0)
			strictEqual(path, '/submenu/')
		},
	})

	const bot = new Bot<MyContext>('123:ABC');
	(bot as any).botInfo = {}
	bot.use(async (ctx, next) => {
		ctx.reply = () => {
			throw new Error('Use sendMenu instead')
		}

		ctx.answerCallbackQuery = async () => true

		return next()
	})
	bot.use(mm.middleware())
	bot.use(() => {
		throw new Error('dont call this function')
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

await test('menu-middleware submenu respond with submenu when no hide function', async () => {
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
			strictEqual(menu.listSubmenus().size, 0)
			strictEqual(path, '/submenu/')
		},
	})

	const bot = new Bot<MyContext>('123:ABC');
	(bot as any).botInfo = {}
	bot.use(async (ctx, next) => {
		ctx.reply = () => {
			throw new Error('Use sendMenu instead')
		}

		ctx.answerCallbackQuery = async () => true

		return next()
	})
	bot.use(mm.middleware())
	bot.use(() => {
		throw new Error('dont call this function')
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

await test('menu-middleware submenu respond with main menu when submenu hidden', async () => {
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
			strictEqual(menu.listSubmenus().size, 1)
			strictEqual(path, '/')
		},
	})

	const bot = new Bot<MyContext>('123:ABC');
	(bot as any).botInfo = {}
	bot.use(async (ctx, next) => {
		ctx.reply = () => {
			throw new Error('Use sendMenu instead')
		}

		ctx.answerCallbackQuery = async () => true

		return next()
	})
	bot.use(mm.middleware())
	bot.use(() => {
		throw new Error('dont call this function')
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
