import {Composer, Context as TelegrafContext} from 'telegraf'
import {Message} from 'telegraf/typings/telegram-types'

import {ActionFunc} from './action-hive'
import {combineTrigger, ensurePathMenu, combinePath} from './path'
import {ContextFunc, RegExpLike} from './generic-types'
import {MenuLike} from './menu-like'
import {SendMenuFunc, editMenuOnContext, replyMenuToContext} from './send-menu'

type Responder<Context> = MenuResponder<Context> | ActionResponder<Context>

interface MenuResponder<Context> {
	readonly type: 'menu';
	readonly trigger: RegExpLike;
	readonly canEnter: ContextFunc<Context, boolean>;
	readonly menu: MenuLike<Context>;
	readonly submenuResponders: ReadonlyArray<MenuResponder<Context>>;
	readonly actionResponders: ReadonlyArray<ActionResponder<Context>>;
}

interface ActionResponder<Context> {
	readonly type: 'action';
	readonly trigger: RegExpLike;
	readonly do: ActionFunc<Context>;
}

export interface Options<Context> {
	readonly sendMenu?: SendMenuFunc<Context>;
}

export class MenuMiddleware<Context extends TelegrafContext> {
	private readonly _sendMenu: SendMenuFunc<Context>

	private readonly _responder: MenuResponder<Context>

	constructor(
		public readonly rootPath: string,
		readonly rootMenu: MenuLike<Context>,
		readonly options: Options<Context> = {}
	) {
		ensurePathMenu(rootPath)

		this._responder = createResponder(new RegExp('^' + rootPath), () => true, rootMenu)

		this._sendMenu = options.sendMenu ?? editMenuOnContext
	}

	/**
	 * Send the root menu to the context. Shortcut for `replyMenuToContext(…)`
	 * @param context Context where the root menu should be replied to
	 * @example
	 * const menuMiddleware = new MenuMiddleware('/', menuTemplate)
	 * bot.command('start', async ctx => menuMiddleware.replyToContext(ctx))
	 */
	async replyToContext(context: Context, path = this.rootPath): Promise<Message> {
		if (typeof path !== 'string') {
			// Happens when a JS User does this as next is the second argument and not a string:
			// ctx.command('start', menuMiddleware.replyToContext)
			throw new TypeError('Do not supply this as a middleware directly. Supply it as a function `ctx => menuMiddleware.replyToContext(ctx)`')
		}

		const {match, responder} = await getLongestMatchMenuResponder(context, path, this._responder)
		if (!match) {
			throw new Error('There is no menu which works with your supplied path')
		}

		return replyMenuToContext(responder.menu, context, path)
	}

	/**
	 * The tree structure can be shown for debugging purposes.
	 * You can take a look on the menu you created.
	 */
	tree(): string {
		return 'Menu Tree\n' + responderTree(this._responder)
	}

	middleware(): (context: Context, next: () => Promise<void>) => void {
		const composer = new Composer<Context>()

		const trigger = new RegExp(this._responder.trigger.source, this._responder.trigger.flags)
		composer.action(trigger, async context => {
			const path = context.callbackQuery!.data!

			let target: string | undefined = path

			if (!path.endsWith('/')) {
				const {match, responder} = await getLongestMatchActionResponder(context, path, this._responder)
				if (match && responder.type === 'action') {
					context.match = match
					const afterwardsTarget = await responder.do(context, match[0])

					if (typeof afterwardsTarget === 'string' && afterwardsTarget) {
						target = combinePath(path, afterwardsTarget)
					} else {
						target = undefined
					}
				}
			}

			if (target) {
				const {match, responder} = await getLongestMatchMenuResponder(context, target, this._responder)
				context.match = match
				const targetPath = match?.[0] ?? this.rootPath
				await Promise.all([
					this._sendMenu(responder.menu, context, targetPath),
					context.answerCbQuery()
				])
			}
		})

		return composer.middleware()
	}
}

function responderMatch<Context>(responder: Responder<Context>, path: string): RegExpExecArray | null {
	return new RegExp(responder.trigger.source, responder.trigger.flags).exec(path)
}

async function getLongestMatchMenuResponder<Context extends TelegrafContext>(context: Context, path: string, current: MenuResponder<Context>): Promise<{match: RegExpExecArray | null; responder: MenuResponder<Context>}> {
	for (const sub of current.submenuResponders) {
		const match = responderMatch(sub, path)
		if (!match) {
			continue
		}

		// Telegraf users expect context.match to contain the relevant match
		context.match = match

		// eslint-disable-next-line no-await-in-loop
		if (await sub.canEnter(context)) {
			return getLongestMatchMenuResponder(context, path, sub)
		}
	}

	const match = responderMatch(current, path)
	return {match, responder: current}
}

async function getLongestMatchActionResponder<Context extends TelegrafContext>(context: Context, path: string, current: MenuResponder<Context>): Promise<{match: RegExpExecArray | null; responder: Responder<Context>}> {
	const currentMatch = responderMatch(current, path)

	for (const sub of current.submenuResponders) {
		const match = responderMatch(sub, path)
		if (!match) {
			continue
		}

		// Telegraf users expect context.match to contain the relevant match
		context.match = match

		// eslint-disable-next-line no-await-in-loop
		if (await sub.canEnter(context)) {
			return getLongestMatchActionResponder(context, path, sub)
		}

		return {match: currentMatch, responder: current}
	}

	for (const sub of current.actionResponders) {
		const match = responderMatch(sub, path)
		if (!match) {
			continue
		}

		return {match, responder: sub}
	}

	return {match: currentMatch, responder: current}
}

function createResponder<Context extends TelegrafContext>(menuTrigger: RegExpLike, canEnter: ContextFunc<Context, boolean>, menu: MenuLike<Context>): MenuResponder<Context> {
	const actionResponders = [...menu.renderActionHandlers(menuTrigger)]
		.map(({trigger, doFunction}): ActionResponder<Context> => ({
			type: 'action',
			trigger,
			do: doFunction
		}))

	const submenuResponders = [...menu.listSubmenus()]
		.map((submenu): MenuResponder<Context> => {
			const submenuTrigger = combineTrigger(menuTrigger, submenu.action)

			const canEnterSubmenu: ContextFunc<Context, boolean> = async context => {
				if (await submenu.hide?.(context)) {
					return false
				}

				return true
			}

			return createResponder(submenuTrigger, canEnterSubmenu, submenu.menu)
		})

	return {
		type: 'menu',
		trigger: menuTrigger,
		canEnter,
		menu,
		actionResponders,
		submenuResponders
	}
}

function responderTree<Context>(responder: MenuResponder<Context>, indention = ''): string {
	let text = treeLine(indention, responder.type, responder.trigger.source)

	const subIndention = '  ' + indention

	for (const action of responder.actionResponders) {
		text += treeLine(subIndention, action.type, action.trigger.source)
	}

	for (const submenu of responder.submenuResponders) {
		text += responderTree(submenu, subIndention)
	}

	return text
}

function treeLine(indention: string, type: string, regexSource: string): string {
	let text = indention + type

	const offset = Math.max(1, 30 - text.length)
	for (let i = 0; i < offset; i++) {
		text += ' '
	}

	text += regexSource
		.replace(/\\\//g, '/')
		.replace(/^\^/, '')
		.replace(/\$$/, '')
	text += '\n'
	return text
}
