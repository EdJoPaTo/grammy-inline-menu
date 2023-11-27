import {rejects} from 'node:assert'
import {test} from 'node:test'
import {Bot, type Context as BaseContext} from 'grammy'
import type {ButtonAction} from '../../source/action-hive.js'
import type {MenuLike} from '../../source/menu-like.js'
import {MenuMiddleware} from '../../source/menu-middleware.js'

await test('menu-middleware javascript-fails not supply reply as a middleware directly', async () => {
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

	await rejects(async () => {
		// @ts-expect-error
		await mm.replyToContext({} as any, next)
	}, {message: /not supply this as a middleware directly/})
})

await test('menu-middleware javascript-fails action is run and no path to update afterwards is returned', async () => {
	const action: ButtonAction<BaseContext> = {
		trigger: /^\/what$/,
		// @ts-expect-error function does not return anything which is the issue here
		doFunction() {},
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
	bot.use(mm.middleware())

	bot.use(() => {
		throw new Error('dont call this function')
	})

	await rejects(async () =>
		bot.handleUpdate({
			update_id: 666,
			callback_query: {
				id: '666',
				from: {} as any,
				chat_instance: '666',
				data: '/what',
			},
		}), {
		message:
			/You have to return in your do function if you want to update the menu afterwards or not. If not just use return false.$/,
	})
})

await test('menu-middleware javascript-fails action is run and an empty path to update afterwards is returned throws', async () => {
	const action: ButtonAction<BaseContext> = {
		trigger: /^\/what$/,
		doFunction() {
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
	bot.use(mm.middleware())

	bot.use(() => {
		throw new Error('dont call this function')
	})

	await rejects(async () =>
		bot.handleUpdate({
			update_id: 666,
			callback_query: {
				id: '666',
				from: {} as any,
				chat_instance: '666',
				data: '/what',
			},
		}), {
		message:
			/You have to return in your do function if you want to update the menu afterwards or not. If not just use return false.$/,
	})
})
