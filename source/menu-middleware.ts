import {Composer, Context as TelegrafContext} from 'telegraf'
import {Message} from 'telegraf/typings/telegram-types'

import {combineTrigger, ensurePathMenu} from './path'
import {ContextFunc, RegExpLike} from './generic-types'
import {editMenuOnContext, replyMenuToContext} from './send-menu'
import {MenuLike} from './menu-like'

export class MenuMiddleware<Context extends TelegrafContext> {
	constructor(
		public readonly rootPath: string,
		private readonly _rootMenu: MenuLike<Context>
	) {
		ensurePathMenu(rootPath)
	}

	/**
	 * Send the root menu to the context. Shortcut for `replyMenuToContext(…)`
	 * @param context Context where the root menu should be replied to
	 * @example
	 * const menuMiddleware = new MenuMiddleware('/', menuTemplate)
	 * bot.command('start', async ctx => menuMiddleware.replyToContext(ctx))
	 */
	async replyToContext(context: Context): Promise<Message> {
		return replyMenuToContext(this._rootMenu, context, this.rootPath)
	}

	middleware(): (context: Context, next: () => Promise<void>) => void {
		return createComposerForMenu(new RegExp('^' + this.rootPath), this._rootMenu, () => true).middleware()
	}
}

function createComposerForMenu<Context extends TelegrafContext>(menuTrigger: RegExpLike, menu: MenuLike<Context>, canEnterMenuCondition: ContextFunc<Context, boolean>): Composer<Context> {
	const composer = new Composer<Context>()

	// This RegExp matches the exact menu -> show the menu without handling any submenus, actions, ...
	composer.action(
		new RegExp(menuTrigger.source + '$', menuTrigger.flags),
		async ctx => editMenuOnContext(menu, ctx, ctx.match![0])
	)

	for (const submenu of menu.listSubmenus()) {
		const canEnterSubmenuCondition = async (context: Context) => {
			if (await submenu.hide?.(context)) {
				return false
			}

			return true
		}

		const subComposer = createComposerForMenu(
			combineTrigger(menuTrigger, submenu.action),
			submenu.menu,
			canEnterSubmenuCondition
		)

		composer.use(subComposer.middleware())
	}

	for (const {trigger, doFunction} of menu.renderActionHandlers(menuTrigger)) {
		composer.action(
			new RegExp(trigger.source, trigger.flags),
			async (context, next) => {
				const data = context.callbackQuery!.data!
				return doFunction(context, next, data)
			}
		)
	}

	// When an action calls next() the menu has to be updated (when condition is still true)
	composer.action(
		new RegExp(menuTrigger.source, menuTrigger.flags),
		Composer.optional<Context>(
			async ctx => canEnterMenuCondition(ctx),
			async ctx => editMenuOnContext(menu, ctx, ctx.match![0])
		)
	)

	const mainComposer = new Composer<Context>()
	mainComposer.action(
		new RegExp(menuTrigger.source, menuTrigger.flags),
		Composer.optional<Context>(
			async ctx => canEnterMenuCondition(ctx),
			composer.middleware()
		)
	)

	return mainComposer
}
