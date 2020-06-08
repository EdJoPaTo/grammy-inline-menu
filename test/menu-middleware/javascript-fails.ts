import test from 'ava'

import {MenuLike} from '../../source/menu-like'

import {MenuMiddleware} from '../../source/menu-middleware'

test('not supply reply as a middleware directly', async t => {
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set(),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => []
	}

	const mm = new MenuMiddleware('/', menu)

	// I cant catch the error here so I am triggering it manually
	// bot.use(mm.replyToContext)

	const next = async () => Promise.resolve()

	await t.throwsAsync(
		async () => {
			// @ts-expect-error
			await mm.replyToContext({} as any, next)
		}, {
			message: /not supply this as a middleware directly/
		}
	)
})
