import test from 'ava'
import {Bot, type Context as BaseContext} from 'grammy'
import type {ButtonAction} from '../../source/action-hive.js'
import type {MenuLike} from '../../source/menu-like.js'
import {MenuMiddleware} from '../../source/menu-middleware.js'

test('not supply reply as a middleware directly', async t => {
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set(),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	}

	const mm = new MenuMiddleware('/', menu)

	// I cant catch the error here so I am triggering it manually
	// bot.use(mm.replyToContext)

	const next = async () => {}

	await t.throwsAsync(
		async () => {
			// @ts-expect-error
			await mm.replyToContext({} as any, next)
		},
		{
			message: /not supply this as a middleware directly/,
		},
	)
})

test.skip('action is run and no path to update afterwards is returned', async t => {
	t.plan(2)
	const action: ButtonAction<BaseContext> = {
		trigger: /^\/what$/,
		// @ts-expect-error
		doFunction() {
			t.pass()
			// Not returning something is the issue here
		},
	}
	const menu: MenuLike<BaseContext> = {
		listSubmenus: () => new Set([]),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	}
	const mm = new MenuMiddleware('/', menu, {
		async sendMenu() {
			throw new Error('dont update menu as error is expected')
		},
	})

	const bot = new Bot('123:ABC');
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

	bot.catch(error => {
		if (error instanceof Error) {
			t.is(
				error.message,
				'You have to return in your do function if you want to update the menu afterwards or not. If not just use return false.',
			)
		} else {
			t.fail('error is not of instance Error')
		}
	})

	await bot.handleUpdate({
		update_id: 666,
		callback_query: {
			id: '666',
			from: {} as any,
			chat_instance: '666',
			data: '/what',
		},
	})
})

test.skip('action is run and an empty path to update afterwards is returned throws', async t => {
	t.plan(2)
	const action: ButtonAction<BaseContext> = {
		trigger: /^\/what$/,
		doFunction() {
			t.pass()
			return ''
		},
	}
	const menu: MenuLike<BaseContext> = {
		listSubmenus: () => new Set([]),
		renderActionHandlers: () => new Set([action]),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	}
	const mm = new MenuMiddleware('/', menu, {
		async sendMenu() {
			throw new Error('dont update menu as error is expected')
		},
	})

	const bot = new Bot('123:ABC');
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

	bot.catch(error => {
		if (error instanceof Error) {
			t.is(
				error.message,
				'You have to return in your do function if you want to update the menu afterwards or not. If not just use return false.',
			)
		} else {
			t.fail('error is not of instance Error')
		}
	})

	await bot.handleUpdate({
		update_id: 666,
		callback_query: {
			id: '666',
			from: {} as any,
			chat_instance: '666',
			data: '/what',
		},
	})
})
