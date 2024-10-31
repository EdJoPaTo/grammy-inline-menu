import {
	type ActionFunc,
	ActionHive,
	type ButtonAction,
} from './action-hive.js';
import type {Body} from './body.js';
import type {
	CopyTextButtonOptions,
	InteractionOptions,
	ManualButtonOptions,
	SingleButtonOptions,
	SwitchToChatOptions,
	UrlButtonOptions,
} from './buttons/basic.js';
import type {ChooseOptions} from './buttons/choose.js';
import {
	createPaginationChoices,
	type PaginationOptions,
	type SetPageFunction,
} from './buttons/pagination.js';
import {generateSelectButtons, type SelectOptions} from './buttons/select.js';
import type {
	ChooseIntoSubmenuOptions,
	SubmenuOptions,
} from './buttons/submenu.js';
import {generateToggleButton, type ToggleOptions} from './buttons/toggle.js';
import {
	type ChoicesRecord,
	combineHideAndChoices,
	generateChoicesButtons,
} from './choices/index.js';
import type {
	ConstOrContextPathFunc,
	ContextFunc,
	ContextPathFunc,
	RegExpLike,
} from './generic-types.js';
import {
	type ButtonTemplate,
	type ButtonTemplateRow,
	type CallbackButtonTemplate,
	type InlineKeyboard,
	Keyboard,
} from './keyboard.js';
import type {MenuLike, Submenu} from './menu-like.js';
import {ensureTriggerChild} from './path.js';

export class MenuTemplate<Context> {
	readonly #body: ContextPathFunc<Context, Body>;
	readonly #keyboard = new Keyboard<Context>();
	readonly #actions = new ActionHive<Context>();
	readonly #submenus = new Set<Submenu<Context>>();

	constructor(
		// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
		body: ConstOrContextPathFunc<Context, Body>,
	) {
		this.#body = typeof body === 'function' ? body : () => body;
	}

	/**
	 * Creates the message body. Usage only recommended for advanced usage of this library.
	 * @param context Context to be supplied to the buttons on on creation
	 */
	async renderBody(context: Context, path: string): Promise<Body> {
		return this.#body(context, path);
	}

	/**
	 * Creates the raw keyboard information. Usage only recommended for advanced usage of this library.
	 * @param context Context to be supplied to the buttons on on creation
	 * @param path Path within the menu. Will be used for the relativePaths
	 */
	async renderKeyboard(
		context: Context,
		path: string,
	): Promise<InlineKeyboard> {
		return this.#keyboard.render(context, path);
	}

	/**
	 * Creates the actions that the buttons of the template want to happen. Usage only recommended for advanced usage of this library.
	 * @param path Path within the menu. Will be used for the relativePaths
	 */
	renderActionHandlers(path: RegExpLike): ReadonlySet<ButtonAction<Context>> {
		return this.#actions.list(path);
	}

	/** Lists the submenus used in this menu template. Usage only recommended for advanced usage of this library. */
	listSubmenus(): ReadonlySet<Submenu<Context>> {
		return this.#submenus;
	}

	/**
	 * Allows for manual creation of a button in a very raw way of doing. Less user friendly but very customizable.
	 * @param button constant or function returning a button representation to be added to the keyboard
	 */
	manual(
		button: ConstOrContextPathFunc<Context, ButtonTemplate>,
		options: ManualButtonOptions<Context> = {},
	): void {
		const {hide} = options;
		if (hide) {
			this.#keyboard.add(
				Boolean(options.joinLastRow),
				async (context, path) => {
					if (await hide(context, path)) {
						return undefined;
					}

					return typeof button === 'function' ? button(context, path) : button;
				},
			);
		} else {
			this.#keyboard.add(Boolean(options.joinLastRow), button);
		}
	}

	/**
	 * Allows for manual creation of many buttons. Less user friendly but very customizable.
	 * @param creator function generating a keyboard part
	 */
	manualRow(creator: ContextPathFunc<Context, ButtonTemplateRow[]>): void {
		this.#keyboard.addCreator(creator);
	}

	/**
	 * Allows for manual creation of actions. Less user friendly but very customizable.
	 * Is probably used together with manualRow.
	 * @param trigger regular expression which is appended to the menu path.
	 * @param action function which is called when the trigger is matched.
	 * @example
	 * menuTemplate.manualRow((context, path) => [[{text: 'Page 2', relativePath: 'custom-pagination:2'}, {text: 'Page 3', relativePath: 'custom-pagination:3'}]])
	 * menuTemplate.manualAction(/custom-pagination:(\d+)$/, (context, path) => {
	 *   console.log('manualAction', path, context.match![1])
	 *   return '.'
	 * })
	 */
	manualAction(trigger: RegExpLike, action: ActionFunc<Context>): void {
		this.#actions.add(trigger, action, undefined);
	}

	/** Add a copy_text button to the keyboard
	 * @example
	 * menuTemplate.copyText({
	 *   text: 'Copy this',
	 *   copy_text: { text: 'content' },
	 * });
	 */
	copyText(options: CopyTextButtonOptions<Context>): void {
		const {text, copy_text} = options;
		this.manual(async (context, path) => ({
			text: typeof text === 'function' ? await text(context, path) : text,
			copy_text: typeof copy_text === 'function'
				? await copy_text(context, path)
				: copy_text,
		}), options);
	}

	/** Add an url button to the keyboard
	 * @example
	 * menuTemplate.url({
	 *   text: 'Homepage',
	 *   url: 'https://edjopato.de/',
	 * });
	 */
	url(options: UrlButtonOptions<Context>): void {
		const {text, url} = options;
		this.manual(async (context, path) => ({
			text: typeof text === 'function' ? await text(context, path) : text,
			url: typeof url === 'function' ? await url(context, path) : url,
		}), options);
	}

	/** Add a switch_inline_query button to the keyboard
	 * @example
	 * menuTemplate.switchToChat({
	 *   text: 'Use the inline mode',
	 *   query: 'prefilled',
	 * });
	 */
	switchToChat(options: SwitchToChatOptions<Context>): void {
		const {text, query} = options;
		this.manual(async (context, path) => ({
			text: typeof text === 'function' ? await text(context, path) : text,
			switch_inline_query: typeof query === 'function'
				? await query(context, path)
				: query,
		}), options);
	}

	/** Add a switch_inline_query_current_chat button to the keyboard
	 * @example
	 * menuTemplate.switchToCurrentChat({
	 *   text: 'Try out the inline mode in this chat',
	 *   query: 'prefilled',
	 * });
	 */
	switchToCurrentChat(options: SwitchToChatOptions<Context>): void {
		const {text, query} = options;
		this.manual(async (context, path) => ({
			text: typeof text === 'function' ? await text(context, path) : text,
			switch_inline_query_current_chat: typeof query === 'function'
				? await query(context, path)
				: query,
		}), options);
	}

	// TODO: add login_url, callback_game, pay for easier access (like url button)
	// see https://core.telegram.org/bots/api#inlinekeyboardbutton

	/**
	 * Button which only purpose is to move around the menu on click.
	 * The relative path is inspired by the cd command.
	 * If you want to execute a function on click use `menuTemplate.interact(…)` instead.
	 * @param relativePath relative target path like 'child/', '..' or '../sibling/
	 * @example menuTemplate.navigate('..', {text: 'back to parent menu'})
	 * @example menuTemplate.navigate('/', {text: 'to the root menu'})
	 * @example menuTemplate.navigate('../sibling/', {text: 'to a sibling menu'})
	 */
	navigate(
		relativePath: string,
		options: SingleButtonOptions<Context>,
	): void {
		this.#keyboard.add(
			Boolean(options.joinLastRow),
			generateCallbackButtonTemplate(options.text, relativePath, options.hide),
		);
	}

	/**
	 * Add a button to which a function is executed on click.
	 * You can update the menu afterwards by returning a relative path. If you only want to update the menu or move around use `menuTemplate.navigate(…)` instead.
	 * @param uniqueIdentifier unique identifier for this button within the menu template
	 * @example
	 * menuTemplate.interact('unique', {
	 *   text: 'Knock Knock',
	 *   do: async context => {
	 *     await context.answerCallbackQuery('Who is there?')
	 *     return false // Do not update the menu afterwards
	 *   }
	 * })
	 * @example
	 * menuTemplate.interact('unique', {
	 *   text: 'Update the current menu afterwards',
	 *   do: async context => {
	 *     // do what you want to do
	 *     return '.' // . like the current one -> this menu
	 *   }
	 * })
	 */
	interact(
		uniqueIdentifier: string,
		options: InteractionOptions<Context>,
	): void {
		if (typeof options.do !== 'function') {
			throw new TypeError(
				'You have to specify `do` in order to have an interaction for this button. If you only want to navigate use `menuTemplate.navigate(…)` instead.',
			);
		}

		this.#actions.add(
			new RegExp(uniqueIdentifier + '$'),
			options.do,
			options.hide,
		);
		this.#keyboard.add(
			Boolean(options.joinLastRow),
			generateCallbackButtonTemplate(
				options.text,
				uniqueIdentifier,
				options.hide,
			),
		);
	}

	/**
	 * Add a button to a submenu
	 * @param uniqueIdentifier unique identifier for this button within the menu template
	 * @param submenu submenu to be entered on click
	 * @example
	 * const submenuTemplate = new MenuTemplate('I am a submenu')
	 * submenuTemplate.interact('unique', {
	 *   text: 'Text',
	 *   do: async ctx => ctx.answerCallbackQuery('You hit a button in a submenu')
	 * })
	 * submenuTemplate.manualRow(createBackMainMenuButtons())
	 *
	 * menuTemplate.submenu('unique', submenuTemplate, { text: 'enter submenu' })
	 */
	submenu(
		uniqueIdentifier: string,
		submenu: MenuLike<Context>,
		options: SubmenuOptions<Context>,
	): void {
		ensureTriggerChild(uniqueIdentifier);
		const trigger = new RegExp(uniqueIdentifier + '/');
		if (
			[...this.#submenus]
				.map(o => o.trigger.source)
				.includes(trigger.source)
		) {
			throw new Error(
				`There is already a submenu with the unique identifier "${uniqueIdentifier}". Change the unique identifier in order to access both menus.`,
			);
		}

		this.#submenus.add({
			trigger,
			hide: options.hide,
			menu: submenu,
		});
		this.#keyboard.add(
			Boolean(options.joinLastRow),
			generateCallbackButtonTemplate(
				options.text,
				uniqueIdentifier + '/',
				options.hide,
			),
		);
	}

	/**
	 * Let the user choose one of many options and execute a function for the one the user picked
	 * @param uniqueIdentifierPrefix prefix which is used to create a unique identifier for each of the resulting buttons
	 * @example
	 * menuTemplate.choose('unique', {
	 *   choices: ['walk', 'swim'],
	 *   async do(ctx, key) {
	 *     await ctx.answerCallbackQuery(`Lets ${key}`);
	 *     return '..';
	 *   }
	 * });
	 */
	choose(
		uniqueIdentifierPrefix: string,
		options: ChooseOptions<Context>,
	): void {
		if (!options.choices || typeof options.do !== 'function') {
			throw new TypeError(
				'You have to specify `choices` and `do` for choose to work.',
			);
		}

		const trigger = new RegExp(uniqueIdentifierPrefix + ':(.+)$');
		this.#actions.add(
			trigger,
			async (context, path) =>
				options.do(context, getKeyFromPath(trigger, path)),
			options.disableChoiceExistsCheck ? options.hide : combineHideAndChoices(
				uniqueIdentifierPrefix,
				options.choices,
				options.hide,
			),
		);

		if (options.setPage) {
			const pageTrigger = new RegExp(uniqueIdentifierPrefix + 'P:(\\d+)$');
			this.#actions.add(
				pageTrigger,
				setPageAction(pageTrigger, options.setPage),
				options.hide,
			);
		}

		this.#keyboard.addCreator(
			generateChoicesButtons(uniqueIdentifierPrefix, false, options),
		);
	}

	/**
	 * Submenu which is entered when a user picks one of many choices
	 * @param uniqueIdentifierPrefix prefix which is used to create a unique identifier for each of the resulting buttons
	 * @param submenu submenu to be entered when one of the choices is picked
	 * @example
	 * const submenu = new MenuTemplate<MyContext>(ctx => `Welcome to ${ctx.match[1]}`)
	 * submenu.interact('unique', {
	 *   text: 'Text',
	 *   do: async ctx => {
	 *     console.log('Take a look at ctx.match. It contains the chosen city', ctx.match)
	 *     await ctx.answerCallbackQuery('You hit a button in a submenu')
	 *     return false
	 *   }
	 * })
	 * submenu.manualRow(createBackMainMenuButtons())
	 *
	 * menu.chooseIntoSubmenu('unique', ['Gotham', 'Mos Eisley', 'Springfield'], submenu)
	 */
	chooseIntoSubmenu(
		uniqueIdentifierPrefix: string,
		submenu: MenuLike<Context>,
		options: ChooseIntoSubmenuOptions<Context>,
	): void {
		ensureTriggerChild(uniqueIdentifierPrefix);
		const trigger = new RegExp(uniqueIdentifierPrefix + ':([^/]+)/');
		if (
			[...this.#submenus]
				.map(o => o.trigger.source)
				.includes(trigger.source)
		) {
			throw new Error(
				`There is already a submenu with the unique identifier "${uniqueIdentifierPrefix}". Change the unique identifier in order to access both menus.`,
			);
		}

		this.#submenus.add({
			trigger,
			hide: options.disableChoiceExistsCheck
				? options.hide
				: combineHideAndChoices(
					uniqueIdentifierPrefix,
					options.choices,
					options.hide,
				),
			menu: submenu,
		});

		if (options.setPage) {
			const pageTrigger = new RegExp(uniqueIdentifierPrefix + 'P:(\\d+)$');
			this.#actions.add(
				pageTrigger,
				setPageAction(pageTrigger, options.setPage),
				options.hide,
			);
		}

		this.#keyboard.addCreator(
			generateChoicesButtons(uniqueIdentifierPrefix, true, options),
		);
	}

	/**
	 * Let the user select one (or multiple) options from a set of choices
	 * @param uniqueIdentifierPrefix prefix which is used to create a unique identifier for each of the resulting buttons
	 * @example
	 * // User can select exactly one
	 * menuTemplate.select('unique', {
	 *   choices: ['at home', 'at work', 'somewhere else'],
	 *   isSet: (context, key) => context.session.currentLocation === key,
	 *   set: (context, key) => {
	 *     context.session.currentLocation = key
	 *     return true
	 *   }
	 * })
	 * @example
	 * // User can select one of multiple options
	 * menuTemplate.select('unique', {
	 *   showFalseEmoji: true,
	 *   choices: ['has arms', 'has legs', 'has eyes', 'has wings'],
	 *   isSet: (context, key) => Boolean(context.session.bodyparts[key]),
	 *   set: (context, key, newState) => {
	 *     context.session.bodyparts[key] = newState
	 *     return true
	 *   }
	 * })
	 */
	select(
		uniqueIdentifierPrefix: string,
		options: SelectOptions<Context>,
	): void {
		if (
			!options.choices
			|| typeof options.set !== 'function'
			|| typeof options.isSet !== 'function'
		) {
			throw new TypeError(
				'You have to specify `choices`, `set` and `isSet` in order to work with select. If you just want to let the user choose between multiple options use `menuTemplate.choose(…)` instead.',
			);
		}

		const trueTrigger = new RegExp(uniqueIdentifierPrefix + 'T:(.+)$');
		this.#actions.add(
			trueTrigger,
			async (context, path) => {
				const key = getKeyFromPath(trueTrigger, path);
				return options.set(context, key, true);
			},
			options.disableChoiceExistsCheck ? options.hide : combineHideAndChoices(
				uniqueIdentifierPrefix + 'T',
				options.choices,
				options.hide,
			),
		);

		const falseTrigger = new RegExp(uniqueIdentifierPrefix + 'F:(.+)$');
		this.#actions.add(
			falseTrigger,
			async (context, path) => {
				const key = getKeyFromPath(falseTrigger, path);
				return options.set(context, key, false);
			},
			options.disableChoiceExistsCheck ? options.hide : combineHideAndChoices(
				uniqueIdentifierPrefix + 'F',
				options.choices,
				options.hide,
			),
		);

		if (options.setPage) {
			const pageTrigger = new RegExp(uniqueIdentifierPrefix + 'P:(\\d+)$');
			this.#actions.add(
				pageTrigger,
				setPageAction(pageTrigger, options.setPage),
				options.hide,
			);
		}

		this.#keyboard.addCreator(
			generateSelectButtons(uniqueIdentifierPrefix, options),
		);
	}

	/**
	 * Shows a row of pagination buttons.
	 * When the user presses one of the buttons `setPage` is called with the specified button.
	 * In order to determine which is the current page and how many pages there are `getCurrentPage` and `getTotalPages` are called to which you have to return the current value
	 * @param uniqueIdentifierPrefix prefix which is used to create a unique identifier for each of the resulting buttons
	 */
	pagination(
		uniqueIdentifierPrefix: string,
		options: PaginationOptions<Context>,
	): void {
		if (
			typeof options.getCurrentPage !== 'function'
			|| typeof options.getTotalPages !== 'function'
			|| typeof options.setPage !== 'function'
		) {
			throw new TypeError(
				'You have to specify `getCurrentPage`, `getTotalPages` and `setPage`.',
			);
		}

		const paginationChoices: ContextFunc<Context, ChoicesRecord> = async context => {
			const totalPages = await options.getTotalPages(context);
			const currentPage = await options.getCurrentPage(context);
			return createPaginationChoices(totalPages, currentPage);
		};

		const trigger = new RegExp(uniqueIdentifierPrefix + ':(\\d+)$');
		this.#actions.add(
			trigger,
			setPageAction(trigger, options.setPage),
			options.hide,
		);
		this.#keyboard.addCreator(
			generateChoicesButtons(uniqueIdentifierPrefix, false, {
				columns: 5,
				choices: paginationChoices,
				hide: options.hide,
			}),
		);
	}

	/**
	 * Toogle a value when the button is pressed.
	 * If you want to toggle multiple values use `menuTemplate.select(…)`
	 * @param uniqueIdentifierPrefix unique identifier for this button within the menu template
	 * @example
	 * menuTemplate.toggle('unique', {
	 *   text: 'Text',
	 *   isSet: context => Boolean(context.session.isFunny),
	 *   set: (context, newState) => {
	 *     context.session.isFunny = newState
	 *     return true
	 *   }
	 * })
	 * @example
	 * // You can use a custom format for the state instead of the default emoji
	 * menuTemplate.toggle('unique', {
	 *   text: 'Lamp',
	 *   formatState: (context, text, state) => `${text}: ${state ? 'on' : 'off'}`,
	 *   isSet: context => Boolean(context.session.lamp),
	 *   set: (context, newState) => {
	 *     context.session.lamp = newState
	 *     return true
	 *   }
	 * })
	 */
	toggle(
		uniqueIdentifierPrefix: string,
		options: ToggleOptions<Context>,
	): void {
		if (
			!options.text
			|| typeof options.set !== 'function'
			|| typeof options.isSet !== 'function'
		) {
			throw new TypeError(
				'You have to specify `text`, `set` and `isSet` in order to work with toggle. If you just want to implement something more generic use `interact`',
			);
		}

		this.#actions.add(
			new RegExp(uniqueIdentifierPrefix + ':true$'),
			async (context, path) => options.set(context, true, path),
			options.hide,
		);

		this.#actions.add(
			new RegExp(uniqueIdentifierPrefix + ':false$'),
			async (context, path) => options.set(context, false, path),
			options.hide,
		);

		this.#keyboard.add(
			Boolean(options.joinLastRow),
			generateToggleButton(uniqueIdentifierPrefix, options),
		);
	}
}

function generateCallbackButtonTemplate<Context>(
	text: ConstOrContextPathFunc<Context, string>,
	relativePath: string,
	hide: undefined | ContextPathFunc<Context, boolean>,
): ContextPathFunc<Context, CallbackButtonTemplate | undefined> {
	if (!text) {
		throw new TypeError(
			'you have to specify `text` in order to show a button label',
		);
	}

	return async (context, path) => {
		if (await hide?.(context, path)) {
			return undefined;
		}

		return {
			relativePath,
			text: typeof text === 'function' ? await text(context, path) : text,
		};
	};
}

function getKeyFromPath(trigger: RegExpLike, path: string): string {
	const match = new RegExp(trigger.source, trigger.flags).exec(path);
	const key = match?.[1];
	if (!key) {
		throw new Error(
			`Could not read key from path '${path}' for trigger '${trigger.source}'`,
		);
	}

	return key;
}

function setPageAction<Context>(
	pageTrigger: RegExpLike,
	setPage: SetPageFunction<Context>,
): ActionFunc<Context> {
	return async (context, path) => {
		const key = getKeyFromPath(pageTrigger, path);
		const page = Number(key);
		await setPage(context, page);
		return '.';
	};
}
