import {Telegraf, Context as TelegrafContext} from 'telegraf'
import test from 'ava'

import {MenuLike, Submenu} from '../../source/menu-like'

import {MenuMiddleware} from '../../source/menu-middleware'
import {ButtonAction} from '../../source/action-hive'

test('action is run without updating menu afterwards', async t => {
	t.plan(3)
	const action: ButtonAction<TelegrafContext> = {
		trigger: /^\/what$/,
		doFunction: (context, path) => {
			t.is(context.match![0], '/what')
			t.is(context.match![1], undefined)
			t.is(path, '/what')
			return false
		}
	}
	const menu: MenuLike<TelegrafContext> = {
		listSubmenus: () => new Set([]),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'whatever',
		renderKeyboard: () => []
	}
	const mm = new MenuMiddleware('/', menu, {
		sendMenu: async () => {
			t.fail('dont open the menu')
			throw new Error('dont open the menu')
		}
	})

	const bot = new Telegraf('')
	bot.context.reply = () => {
		t.fail('Use sendMenu instead')
		throw new Error('Use sendMenu instead')
	}

	bot.context.answerCbQuery = async () => {
		t.fail()
		return Promise.resolve(true)
	}

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
			data: '/what'
		}
	})
})

test('action is run and updating menu afterwards with path', async t => {
	t.plan(5)
	const action: ButtonAction<TelegrafContext> = {
		trigger: /^\/what$/,
		doFunction: (context, path) => {
			t.is(context.match![0], '/what')
			t.is(context.match![1], undefined)
			t.is(path, '/what')
			return '.'
		}
	}
	const menu: MenuLike<TelegrafContext> = {
		listSubmenus: () => new Set([]),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'whatever',
		renderKeyboard: () => []
	}
	const mm = new MenuMiddleware('/', menu, {
		sendMenu: async (_menu, _context, path) => {
			t.is(path, '/')
			return Promise.resolve()
		}
	})

	const bot = new Telegraf('')
	bot.context.reply = () => {
		t.fail('Use sendMenu instead')
		throw new Error('Use sendMenu instead')
	}

	bot.context.answerCbQuery = async () => {
		t.pass()
		return Promise.resolve(true)
	}

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
			data: '/what'
		}
	})
})

test('action is run and updating menu afterwards with true', async t => {
	t.plan(5)
	const action: ButtonAction<TelegrafContext> = {
		trigger: /^\/what$/,
		doFunction: (context, path) => {
			t.is(context.match![0], '/what')
			t.is(context.match![1], undefined)
			t.is(path, '/what')
			return true
		}
	}
	const menu: MenuLike<TelegrafContext> = {
		listSubmenus: () => new Set([]),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'whatever',
		renderKeyboard: () => []
	}
	const mm = new MenuMiddleware('/', menu, {
		sendMenu: async (_menu, _context, path) => {
			t.is(path, '/')
			return Promise.resolve()
		}
	})

	const bot = new Telegraf('')
	bot.context.reply = () => {
		t.fail('Use sendMenu instead')
		throw new Error('Use sendMenu instead')
	}

	bot.context.answerCbQuery = async () => {
		t.pass()
		return Promise.resolve(true)
	}

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
			data: '/what'
		}
	})
})

test('action returns non existing path afterwards throws Error', async t => {
	t.plan(1)
	const action: ButtonAction<TelegrafContext> = {
		trigger: /^custom\/what$/,
		doFunction: () => '/foo/'
	}
	const menu: MenuLike<TelegrafContext> = {
		listSubmenus: () => new Set([]),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'whatever',
		renderKeyboard: () => []
	}
	const mm = new MenuMiddleware('custom/', menu, {
		sendMenu: async () => {
			t.fail('dont send main menu')
			throw new Error('dont send main menu')
		}
	})

	const bot = new Telegraf('')
	bot.context.reply = () => {
		t.fail('Use sendMenu instead')
		throw new Error('Use sendMenu instead')
	}

	bot.context.answerCbQuery = async () => {
		t.fail()
		return Promise.resolve(true)
	}

	bot.use(mm.middleware())

	bot.use(() => {
		t.fail()
	})

	// TODO: improve typings when telegraf 3.39 is released
	bot.catch((error: any) => {
		if (error instanceof Error) {
			t.is(error.message, 'There is no menu "/foo/" which can be reached in this menu')
		} else {
			t.fail()
		}
	})

	await bot.handleUpdate({
		update_id: 666,
		callback_query: {
			id: '666',
			from: {} as any,
			chat_instance: '666',
			data: 'custom/what'
		}
	})
})

test('not existing action updates menu', async t => {
	t.plan(2)
	const action: ButtonAction<TelegrafContext> = {
		trigger: /^\/what$/,
		doFunction: () => {
			t.fail('not the correct action')
			throw new Error('not the correct action')
		}
	}
	const menu: MenuLike<TelegrafContext> = {
		listSubmenus: () => new Set([]),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'whatever',
		renderKeyboard: () => []
	}
	const mm = new MenuMiddleware('/', menu, {
		sendMenu: async (_menu, _context, path) => {
			t.is(path, '/')
			return Promise.resolve()
		}
	})

	const bot = new Telegraf('')
	bot.context.reply = () => {
		t.fail('Use sendMenu instead')
		throw new Error('Use sendMenu instead')
	}

	bot.context.answerCbQuery = async () => {
		t.pass()
		return Promise.resolve(true)
	}

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
			data: '/where'
		}
	})
})

test('action in submenu is run', async t => {
	t.plan(3)
	const action: ButtonAction<TelegrafContext> = {
		trigger: /^\/submenu\/what$/,
		doFunction: (context, path) => {
			t.is(context.match![0], '/submenu/what')
			t.is(context.match![1], undefined)
			t.is(path, '/submenu/what')
			return false
		}
	}
	const submenuMenu: MenuLike<TelegrafContext> = {
		listSubmenus: () => new Set(),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'submenu',
		renderKeyboard: () => []
	}
	const submenu: Submenu<TelegrafContext> = {
		action: /submenu\//,
		hide: () => false,
		menu: submenuMenu
	}
	const menu: MenuLike<TelegrafContext> = {
		listSubmenus: () => new Set([submenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => []
	}
	const mm = new MenuMiddleware('/', menu, {
		sendMenu: async () => {
			t.fail('dont open the menu')
			throw new Error('dont open the menu')
		}
	})

	const bot = new Telegraf('')
	bot.context.reply = () => {
		t.fail('Use sendMenu instead')
		throw new Error('Use sendMenu instead')
	}

	bot.context.answerCbQuery = async () => {
		t.fail()
		return Promise.resolve(true)
	}

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
			data: '/submenu/what'
		}
	})
})

test('not existing action in submenu updates submenu', async t => {
	t.plan(2)
	const action: ButtonAction<TelegrafContext> = {
		trigger: /^\/submenu\/what$/,
		doFunction: () => {
			t.fail('not the correct action')
			throw new Error('not the correct action')
		}
	}
	const submenuMenu: MenuLike<TelegrafContext> = {
		listSubmenus: () => new Set(),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'submenu',
		renderKeyboard: () => []
	}
	const submenu: Submenu<TelegrafContext> = {
		action: /submenu\//,
		hide: () => false,
		menu: submenuMenu
	}
	const menu: MenuLike<TelegrafContext> = {
		listSubmenus: () => new Set([submenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => []
	}
	const mm = new MenuMiddleware('/', menu, {
		sendMenu: async (_menu, _context, path) => {
			t.is(path, '/submenu/')
			return Promise.resolve()
		}
	})

	const bot = new Telegraf('')
	bot.context.reply = () => {
		t.fail('Use sendMenu instead')
		throw new Error('Use sendMenu instead')
	}

	bot.context.answerCbQuery = async () => {
		t.pass()
		return Promise.resolve(true)
	}

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
			data: '/submenu/where'
		}
	})
})

test('action in hidden submenu updates main menu', async t => {
	t.plan(2)
	const action: ButtonAction<TelegrafContext> = {
		trigger: /^\/submenu\/what$/,
		doFunction: () => {
			t.fail('submenu is hidden')
			throw new Error('submenu is hidden')
		}
	}
	const submenuMenu: MenuLike<TelegrafContext> = {
		listSubmenus: () => new Set(),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'submenu',
		renderKeyboard: () => []
	}
	const submenu: Submenu<TelegrafContext> = {
		action: /submenu\//,
		hide: () => true,
		menu: submenuMenu
	}
	const menu: MenuLike<TelegrafContext> = {
		listSubmenus: () => new Set([submenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => []
	}
	const mm = new MenuMiddleware('/', menu, {
		sendMenu: async (_menu, _context, path) => {
			t.is(path, '/')
			return Promise.resolve()
		}
	})

	const bot = new Telegraf('')
	bot.context.reply = () => {
		t.fail('Use sendMenu instead')
		throw new Error('Use sendMenu instead')
	}

	bot.context.answerCbQuery = async () => {
		t.pass()
		return Promise.resolve(true)
	}

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
			data: '/submenu/what'
		}
	})
})

test('action in non existing submenu updates main menu', async t => {
	t.plan(2)
	const action: ButtonAction<TelegrafContext> = {
		trigger: /^\/submenu\/what$/,
		doFunction: () => {
			t.fail('submenu is hidden')
			throw new Error('submenu is hidden')
		}
	}
	const submenuMenu: MenuLike<TelegrafContext> = {
		listSubmenus: () => new Set(),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'submenu',
		renderKeyboard: () => []
	}
	const submenu: Submenu<TelegrafContext> = {
		action: /submenu\//,
		hide: () => true,
		menu: submenuMenu
	}
	const menu: MenuLike<TelegrafContext> = {
		listSubmenus: () => new Set([submenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => []
	}
	const mm = new MenuMiddleware('/', menu, {
		sendMenu: async (_menu, _context, path) => {
			t.is(path, '/')
			return Promise.resolve()
		}
	})

	const bot = new Telegraf('')
	bot.context.reply = () => {
		t.fail('Use sendMenu instead')
		throw new Error('Use sendMenu instead')
	}

	bot.context.answerCbQuery = async () => {
		t.pass()
		return Promise.resolve(true)
	}

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
			data: '/foo/bar'
		}
	})
})

test('action run took too long and updating menu afterwards tries to answerCbQuery and fails as being old but does not throw', async t => {
	t.plan(2)
	const action: ButtonAction<TelegrafContext> = {
		trigger: /^\/what$/,
		doFunction: () => {
			return '.'
		}
	}
	const menu: MenuLike<TelegrafContext> = {
		listSubmenus: () => new Set([]),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'whatever',
		renderKeyboard: () => []
	}
	const mm = new MenuMiddleware('/', menu, {
		sendMenu: async () => {
			return Promise.resolve()
		}
	})

	const bot = new Telegraf('')
	bot.context.reply = () => {
		t.fail('Use sendMenu instead')
		throw new Error('Use sendMenu instead')
	}

	bot.context.answerCbQuery = async () => {
		t.pass()
		throw new Error('Bad Request: query is too old and response timeout expired or query ID is invalid')
	}

	bot.use(mm.middleware())

	bot.use(() => {
		t.fail()
	})

	await t.notThrowsAsync(async () =>
		bot.handleUpdate({
			update_id: 666,
			callback_query: {
				id: '666',
				from: {} as any,
				chat_instance: '666',
				data: '/what'
			}
		})
	)
})

test('updating menu still throws unknown error from answerCbQuery', async t => {
	t.plan(2)
	const action: ButtonAction<TelegrafContext> = {
		trigger: /^\/what$/,
		doFunction: () => {
			return '.'
		}
	}
	const menu: MenuLike<TelegrafContext> = {
		listSubmenus: () => new Set([]),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'whatever',
		renderKeyboard: () => []
	}
	const mm = new MenuMiddleware('/', menu, {
		sendMenu: async () => {
			return Promise.resolve()
		}
	})

	const bot = new Telegraf('')
	bot.context.reply = () => {
		t.fail('Use sendMenu instead')
		throw new Error('Use sendMenu instead')
	}

	bot.context.answerCbQuery = async () => {
		t.pass()
		throw new Error('Whatever went wrong here for the test')
	}

	bot.use(mm.middleware())

	bot.use(() => {
		t.fail()
	})

	bot.catch((error: any) => {
		if (error instanceof Error) {
			t.is(error.message, 'Whatever went wrong here for the test')
		} else {
			t.fail('not an error?')
		}
	})

	await bot.handleUpdate({
		update_id: 666,
		callback_query: {
			id: '666',
			from: {} as any,
			chat_instance: '666',
			data: '/what'
		}
	})
})
