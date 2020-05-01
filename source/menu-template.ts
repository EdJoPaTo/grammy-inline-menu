import {InlineKeyboardButton} from 'telegram-typings'

import {Body} from './body'
import {ButtonAction, ActionHive, ActionFunc} from './action-hive'
import {Choices, ChoicesRecord, generateChoicesButtons, combineHideAndChoices} from './choices'
import {ChooseOptions} from './buttons/choose'
import {ContextFunc, ContextPathFunc, ConstOrContextFunc, ConstOrContextPathFunc, RegExpLike} from './generic-types'
import {ensureTriggerChild} from './path'
import {Keyboard, ButtonTemplate, CallbackButtonTemplate, ButtonTemplateRow} from './keyboard'
import {MenuLike, Submenu} from './menu-like'
import {PaginationOptions, createPaginationChoices, SetPageFunction} from './buttons/pagination'
import {prefixEmoji, PrefixOptions} from './prefix'
import {SelectOptions, generateSelectButtons} from './buttons/select'
import {SingleButtonOptions} from './buttons/basic'
import {SubmenuOptions, ChooseIntoSubmenuOptions} from './buttons/submenu'

export interface InteractionOptions<Context> extends SingleButtonOptions<Context> {
	readonly do: (context: Context, next: () => Promise<void>, path: string) => void | Promise<unknown>;
}

export interface ToggleOptions<Context> extends SingleButtonOptions<Context>, PrefixOptions {
	readonly set: (context: Context, newState: boolean) => Promise<unknown> | void;
	readonly isSet: ContextFunc<Context, boolean>;
}

export class MenuTemplate<Context> {
	private readonly _body: ContextPathFunc<Context, Body>
	private readonly _keyboard: Keyboard<Context> = new Keyboard()
	private readonly _actions: ActionHive<Context> = new ActionHive()
	private readonly _submenus: Set<Submenu<Context>> = new Set()

	constructor(
		readonly body: ConstOrContextPathFunc<Context, Body>
	) {
		this._body = typeof body === 'function' ? body : () => body
	}

	/**
	 * Creates the message body. Usage only recommended for advanced usage of this library.
	 * @param context Context to be supplied to the buttons on on creation
	 */
	async renderBody(context: Context, path: string): Promise<Body> {
		return this._body(context, path)
	}

	/**
	 * Creates the raw keyboard information. Usage only recommended for advanced usage of this library.
	 * @param context Context to be supplied to the buttons on on creation
	 * @param path Path within the menu. Will be used for the relativePaths
	 */
	async renderKeyboard(context: Context, path: string): Promise<InlineKeyboardButton[][]> {
		return this._keyboard.render(context, path)
	}

	/**
	 * Creates the actions that the buttons of the template want to happen. Usage only recommended for advanced usage of this library.
	 * @param path Path within the menu. Will be used for the relativePaths
	 */
	renderActionHandlers(path: RegExpLike): Set<ButtonAction<Context>> {
		return this._actions.list(path)
	}

	/**
	 * Lists the submenus used in this menu template. Usage only recommended for advanced usage of this library.
	 */
	listSubmenus(): ReadonlySet<Submenu<Context>> {
		return this._submenus
	}

	/**
	 * Allows for manual creation of a button in a very raw way of doing. Less user friendly but very customizable.
	 * @param button constant or function returning a button representation to be added to the keyboard
	 * @param options additional options
	 */
	manual(button: ConstOrContextPathFunc<Context, ButtonTemplate>, options: SingleButtonOptions<Context> = {}): void {
		const {hide} = options
		if (hide) {
			this._keyboard.add(Boolean(options.joinLastRow), async (context, path) => {
				if (await hide(context)) {
					return undefined
				}

				return typeof button === 'function' ? button(context, path) : button
			})
		} else {
			this._keyboard.add(Boolean(options.joinLastRow), button)
		}
	}

	/**
	 * Allows for manual creation of many buttons. Less user friendly but very customizable.
	 * @param creator function generating a keyboard part
	 */
	manualRow(creator: ConstOrContextPathFunc<Context, ButtonTemplateRow[]>): void {
		this._keyboard.addCreator(creator)
	}

	/**
	 * Add an url button to the keyboard
	 * @param text text to be displayed on the button
	 * @param url url where this button should be heading
	 * @param options additional options
	 */
	url(text: ConstOrContextPathFunc<Context, string>, url: ConstOrContextPathFunc<Context, string>, options: SingleButtonOptions<Context> = {}): void {
		this.manual(async (context, path) => ({
			text: typeof text === 'function' ? await text(context, path) : text,
			url: typeof url === 'function' ? await url(context, path) : url
		}), options)
	}

	/**
	 * Add a switch_inline_query button to the keyboard
	 * @param text text to be displayed on the button
	 * @param query query that is shown next to the bot username. Can be empty ('')
	 * @param options additional options
	 */
	switchToChat(text: ConstOrContextPathFunc<Context, string>, query: ConstOrContextPathFunc<Context, string>, options: SingleButtonOptions<Context> = {}): void {
		this.manual(async (context, path) => ({
			text: typeof text === 'function' ? await text(context, path) : text,
			switch_inline_query: typeof query === 'function' ? await query(context, path) : query
		}), options)
	}

	/**
	 * Add a switch_inline_query_current_chat button to the keyboard
	 * @param text text to be displayed on the button
	 * @param query query that is shown next to the bot username. Can be empty ('')
	 * @param options additional options
	 */
	switchToCurrentChat(text: ConstOrContextPathFunc<Context, string>, query: ConstOrContextPathFunc<Context, string>, options: SingleButtonOptions<Context> = {}): void {
		this.manual(async (context, path) => ({
			text: typeof text === 'function' ? await text(context, path) : text,
			switch_inline_query_current_chat: typeof query === 'function' ? await query(context, path) : query
		}), options)
	}

	// TODO: add login_url, callback_game, pay for easier access (like url button)
	// see https://core.telegram.org/bots/api#inlinekeyboardbutton

	navigate(text: ConstOrContextPathFunc<Context, string>, relativePath: string, options: SingleButtonOptions<Context> = {}): void {
		this._keyboard.add(Boolean(options.joinLastRow), generateCallbackButtonTemplate(text, relativePath, options.hide))
	}

	submenu(text: ConstOrContextPathFunc<Context, string>, action: string, submenu: MenuLike<Context>, options: SubmenuOptions<Context> = {}): void {
		ensureTriggerChild(action)
		this._submenus.add({
			action: new RegExp(action + '/'),
			hide: options.hide,
			leaveOnChildInteraction: Boolean(options.leaveOnChildInteraction),
			menu: submenu
		})
		this._keyboard.add(Boolean(options.joinLastRow), generateCallbackButtonTemplate(text, action + '/', options.hide))
	}

	chooseIntoSubmenu(actionPrefix: string, choices: ConstOrContextFunc<Context, Choices>, submenu: MenuLike<Context>, options: ChooseIntoSubmenuOptions<Context> = {}): void {
		ensureTriggerChild(actionPrefix)
		this._submenus.add({
			action: new RegExp(actionPrefix + ':([^/]+)/'),
			hide: combineHideAndChoices(choices, options.hide),
			leaveOnChildInteraction: Boolean(options.leaveOnChildInteraction),
			menu: submenu
		})

		if (options.setPage) {
			this._actions.add(new RegExp(actionPrefix + 'P:(\\d+)$'), setPageAction(options.setPage), options.hide)
		}

		this._keyboard.addCreator(generateChoicesButtons(actionPrefix, true, choices, options))
	}

	interact(text: ConstOrContextPathFunc<Context, string>, action: string, options: InteractionOptions<Context>): void {
		this._actions.add(new RegExp(action + '$'), async (context, next, path) => options.do(context, next, path), options.hide)
		this._keyboard.add(Boolean(options.joinLastRow), generateCallbackButtonTemplate(text, action, options.hide))
	}

	choose(actionPrefix: string, choices: ConstOrContextFunc<Context, Choices>, options: ChooseOptions<Context>): void {
		const trigger = new RegExp(actionPrefix + ':(.+)$')
		this._actions.add(
			trigger,
			async (context, next, path, trigger) => options.do(context, next, getKeyFromPath(trigger, path)),
			combineHideAndChoices(choices, options.hide)
		)

		if (options.setPage) {
			this._actions.add(new RegExp(actionPrefix + 'P:(\\d+)$'), setPageAction(options.setPage), options.hide)
		}

		this._keyboard.addCreator(generateChoicesButtons(actionPrefix, false, choices, options))
	}

	select(actionPrefix: string, choices: ConstOrContextFunc<Context, Choices>, options: SelectOptions<Context>): void {
		this._actions.add(
			new RegExp(actionPrefix + 'T:(.+)$'),
			async (context, next, path, trigger) => {
				const key = getKeyFromPath(trigger, path)
				await options.set(context, key, true)
				return next()
			},
			combineHideAndChoices(choices, options.hide)
		)

		this._actions.add(
			new RegExp(actionPrefix + 'F:(.+)$'),
			async (context, next, path, trigger) => {
				const key = getKeyFromPath(trigger, path)
				await options.set(context, key, false)
				return next()
			},
			combineHideAndChoices(choices, options.hide)
		)

		if (options.setPage) {
			this._actions.add(new RegExp(actionPrefix + 'P:(\\d+)$'), setPageAction(options.setPage), options.hide)
		}

		this._keyboard.addCreator(generateSelectButtons(actionPrefix, choices, options))
	}

	pagination(actionPrefix: string, options: PaginationOptions<Context>): void {
		const paginationChoices: ContextFunc<Context, ChoicesRecord> = async context => {
			if (await options.hide?.(context)) {
				return {}
			}

			const totalPages = await options.getTotalPages(context)
			const currentPage = await options.getCurrentPage(context)
			return createPaginationChoices(totalPages, currentPage)
		}

		this.choose(actionPrefix, paginationChoices, {
			columns: 5,
			hide: options.hide,
			do: async (context, next, key) => {
				const page = Number(key)
				await options.setPage(context, page)
				return next()
			}
		})
	}

	toggle(text: ConstOrContextPathFunc<Context, string>, actionPrefix: string, options: ToggleOptions<Context>): void {
		this._actions.add(
			new RegExp(actionPrefix + ':true$'),
			async (context, next) => {
				await options.set(context, true)
				await next()
			},
			options.hide
		)

		this._actions.add(
			new RegExp(actionPrefix + ':false$'),
			async (context, next) => {
				await options.set(context, false)
				await next()
			},
			options.hide
		)

		this._keyboard.add(Boolean(options.joinLastRow), async (context, path): Promise<CallbackButtonTemplate> => {
			const isSet = await options.isSet(context)
			return {
				text: await prefixEmoji(text, isSet, options, context, path),
				relativePath: actionPrefix + ':' + (isSet ? 'false' : 'true')
			}
		})
	}
}

function generateCallbackButtonTemplate<Context>(text: ConstOrContextPathFunc<Context, string>, relativePath: string, hide: undefined | ContextFunc<Context, boolean>): ContextPathFunc<Context, CallbackButtonTemplate | undefined> {
	return async (context, path) => {
		if (hide && await hide(context)) {
			return undefined
		}

		return {
			relativePath,
			text: typeof text === 'function' ? await text(context, path) : text
		}
	}
}

function getKeyFromPath(trigger: RegExpLike, path: string): string {
	const match = new RegExp(trigger.source, trigger.flags).exec(path)
	return match![1]
}

function setPageAction<Context>(setPage: SetPageFunction<Context>): ActionFunc<Context> {
	return async (context, next, path, trigger) => {
		const key = getKeyFromPath(trigger, path)
		const page = Number(key)
		await setPage(context, page)
		return next()
	}
}
