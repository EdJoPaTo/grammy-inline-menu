import {Context as BaseContext, Api} from 'grammy'
import {Message} from '@grammyjs/types'

import {Body, TextBody, MediaBody, LocationBody, isMediaBody, isLocationBody, isTextBody, getBodyText, isVenueBody, VenueBody, isInvoiceBody} from './body.js'
import {ensurePathMenu} from './path.js'
import {InlineKeyboard} from './keyboard.js'
import {MenuLike} from './menu-like.js'

/**
 * Generic Method which is able to send a menu to a context (given a path where it is)
 */
export type SendMenuFunc<Context> = (menu: MenuLike<Context>, context: Context, path: string) => Promise<unknown>

/**
 * Method which is able to send a menu to a chat.
 * Generated via `generateSendMenuToChatFunction`.
 */
export type SendMenuToChatFunction<Context> = (chatId: string | number, context: Context, other?: Readonly<Record<string, unknown>>) => Promise<Message>

/**
 * Method which is able to edit a message in a chat into a menu.
 * Generated via `generateEditMessageIntoMenuFunction`.
 */
export type EditMessageIntoMenuFunction<Context> = (chatId: number | string, messageId: number, context: Context, other?: Readonly<Record<string, unknown>>) => Promise<Message | true>

/**
 * Reply a menu to a context as a new message
 * @param menu menu to be shown
 * @param context current grammY context to reply the menu to it
 * @param path path of the menu
 * @param other optional additional options
 */
export async function replyMenuToContext<Context extends BaseContext>(menu: MenuLike<Context>, context: Context, path: string, other?: Readonly<Record<string, unknown>>) {
	ensurePathMenu(path)
	const body = await menu.renderBody(context, path)
	const keyboard = await menu.renderKeyboard(context, path)
	return replyRenderedMenuPartsToContext(body, keyboard, context, other)
}

/**
 * Edit the context into the menu. If thats not possible the current message is deleted and a new message is replied
 * @param menu menu to be shown
 * @param context current grammY context to edit the menu into
 * @param path path of the menu
 * @param other optional additional options
 */
export async function editMenuOnContext<Context extends BaseContext>(menu: MenuLike<Context>, context: Context, path: string, other: Readonly<Record<string, unknown>> = {}) {
	ensurePathMenu(path)
	const body = await menu.renderBody(context, path)
	const keyboard = await menu.renderKeyboard(context, path)

	const message = context.callbackQuery?.message
	if (!message) {
		return replyRenderedMenuPartsToContext(body, keyboard, context, other)
	}

	if (isMediaBody(body)) {
		if ('animation' in message || 'audio' in message || 'document' in message || 'photo' in message || 'video' in message) {
			return context.editMessageMedia(
				{
					type: body.type,
					media: body.media,
					caption: body.text,
					parse_mode: body.parse_mode,
				},
				createGenericOther(keyboard, other),
			)
				.catch(catchMessageNotModified)
		}
	} else if (isLocationBody(body) || isVenueBody(body) || isInvoiceBody(body)) {
		// Dont edit the message, just recreate it.
	} else if (isTextBody(body)) {
		const text = getBodyText(body)
		if ('text' in message) {
			return context.editMessageText(text, createTextOther(body, keyboard, other))
				.catch(catchMessageNotModified)
		}
	} else {
		throw new TypeError('The body has to be a string or an object containing text or media. Check the grammy-inline-menu Documentation.')
	}

	// The current menu is incompatible: delete and reply new one
	const [repliedMessage] = await Promise.all([
		replyRenderedMenuPartsToContext(body, keyboard, context, other),
		deleteMenuFromContext(context),
	])
	return repliedMessage
}

/**
 * Delete the message on the context.
 * If thats not possible the reply markup (keyboard) is removed. The user can not press any buttons on that old message.
 * @param context context of the message to be deleted
 */
export async function deleteMenuFromContext<Context extends BaseContext>(context: Context): Promise<void> {
	try {
		await context.deleteMessage()
	} catch {
		await context.editMessageReplyMarkup(undefined)
	}
}

/**
 * Deletes to menu of the current context and replies a new one ensuring the menu is at the end of the chat.
 * @param menu menu to be shown
 * @param context current grammY context to send the menu to
 * @param path path of the menu
 * @param other optional additional options
 */
export async function resendMenuToContext<Context extends BaseContext>(menu: MenuLike<Context>, context: Context, path: string, other: Readonly<Record<string, unknown>> = {}) {
	const [menuMessage] = await Promise.all([
		replyMenuToContext(menu, context, path, other),
		deleteMenuFromContext(context),
	])
	return menuMessage
}

function catchMessageNotModified(error: unknown): false {
	if (error instanceof Error && error.message.includes('message is not modified')) {
		// ignore
		return false
	}

	throw error
}

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
async function replyRenderedMenuPartsToContext<Context extends BaseContext>(body: Body, keyboard: InlineKeyboard, context: Context, other: Readonly<Record<string, unknown>> = {}) {
	if (isMediaBody(body)) {
		const mediaOther = createSendMediaOther(body, keyboard, other)

		// eslint-disable-next-line default-case
		switch (body.type) {
			case 'animation':
				return context.replyWithAnimation(body.media, mediaOther)
			case 'audio':
				return context.replyWithAudio(body.media, mediaOther)
			case 'document':
				return context.replyWithDocument(body.media, mediaOther)
			case 'photo':
				return context.replyWithPhoto(body.media, mediaOther)
			case 'video':
				return context.replyWithVideo(body.media, mediaOther)
		}
	}

	if (isLocationBody(body)) {
		return context.replyWithLocation(body.location.latitude, body.location.longitude, createLocationOther(body, keyboard, other))
	}

	if (isVenueBody(body)) {
		const {location, title, address} = body.venue
		return context.replyWithVenue(location.latitude, location.longitude, title, address, createVenueOther(body, keyboard, other))
	}

	if (isInvoiceBody(body)) {
		const {title, description, payload, provider_token, currency, prices} = body.invoice
		return context.replyWithInvoice(title, description, payload, provider_token, currency, prices, createGenericOther(keyboard, other))
	}

	if (isTextBody(body)) {
		const text = getBodyText(body)
		return context.reply(text, createTextOther(body, keyboard, other))
	}

	throw new Error('The body has to be a string or an object containing text or media. Check the grammy-inline-menu Documentation.')
}

/**
 * Generate a function to send the menu towards a chat from external events
 * @param telegram The Telegram object to do the API calls with later on
 * @param menu menu to be shown
 * @param path path of the menu
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export function generateSendMenuToChatFunction<Context>(telegram: Readonly<Api>, menu: MenuLike<Context>, path: string): SendMenuToChatFunction<Context> {
	return async (chatId, context, other = {}) => {
		const body = await menu.renderBody(context, path)
		const keyboard = await menu.renderKeyboard(context, path)

		if (isMediaBody(body)) {
			const mediaOther = createSendMediaOther(body, keyboard, other)

			// eslint-disable-next-line default-case
			switch (body.type) {
				case 'animation':
					return telegram.sendAnimation(chatId, body.media, mediaOther)
				case 'audio':
					return telegram.sendAudio(chatId, body.media, mediaOther)
				case 'document':
					return telegram.sendDocument(chatId, body.media, mediaOther)
				case 'photo':
					return telegram.sendPhoto(chatId, body.media, mediaOther)
				case 'video':
					return telegram.sendVideo(chatId, body.media, mediaOther)
			}
		}

		if (isLocationBody(body)) {
			return telegram.sendLocation(chatId, body.location.latitude, body.location.longitude, createLocationOther(body, keyboard, other))
		}

		if (isVenueBody(body)) {
			const {location, title, address} = body.venue
			return telegram.sendVenue(chatId, location.latitude, location.longitude, title, address, createVenueOther(body, keyboard, other))
		}

		if (isInvoiceBody(body)) {
			const {title, description, payload, provider_token, currency, prices} = body.invoice
			return telegram.sendInvoice(chatId, title, description, payload, provider_token, currency, prices, createGenericOther(keyboard, other))
		}

		if (isTextBody(body)) {
			const text = getBodyText(body)
			return telegram.sendMessage(chatId, text, createTextOther(body, keyboard, other))
		}

		throw new Error('The body has to be a string or an object containing text or media. Check the grammy-inline-menu Documentation.')
	}
}

/**
 * Edit the message into the the menu.
 * This fails when the current message is not compatible with the menu (you cant edit a media message into a text message and vice versa)
 * @param telegram The Telegram object to do the API calls with later on
 * @param menu menu to be shown
 * @param path path of the menu
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export function generateEditMessageIntoMenuFunction<Context>(telegram: Readonly<Api>, menu: MenuLike<Context>, path: string): EditMessageIntoMenuFunction<Context> {
	return async (chatId, messageId, context, other = {}) => {
		const body = await menu.renderBody(context, path)
		const keyboard = await menu.renderKeyboard(context, path)

		if (isMediaBody(body)) {
			return telegram.editMessageMedia(
				chatId,
				messageId,
				{
					type: body.type,
					media: body.media,
					caption: body.text,
					parse_mode: body.parse_mode,
				},
				createGenericOther(keyboard, other),
			)
		}

		if (isLocationBody(body)) {
			throw new Error('You can not edit into a location body. You have to send the menu as a new message.')
		}

		if (isVenueBody(body)) {
			throw new Error('You can not edit into a venue body. You have to send the menu as a new message.')
		}

		if (isInvoiceBody(body)) {
			throw new Error('You can not edit into an invoice body. You have to send the menu as a new message.')
		}

		if (isTextBody(body)) {
			const text = getBodyText(body)
			return telegram.editMessageText(chatId, messageId, text, createTextOther(body, keyboard, other))
		}

		throw new Error('The body has to be a string or an object containing text or media. Check the grammy-inline-menu Documentation.')
	}
}

function createTextOther(body: string | TextBody, keyboard: InlineKeyboard, base: Readonly<Record<string, unknown>>) {
	return {
		...base,
		parse_mode: typeof body === 'string' ? undefined : body.parse_mode,
		disable_web_page_preview: typeof body !== 'string' && body.disable_web_page_preview,
		reply_markup: {
			inline_keyboard: keyboard.map(o => [...o]),
		},
	}
}

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
function createSendMediaOther(body: MediaBody, keyboard: InlineKeyboard, base: Readonly<Record<string, unknown>>) {
	return {
		...base,
		parse_mode: body.parse_mode,
		caption: body.text,
		reply_markup: {
			inline_keyboard: keyboard.map(o => [...o]),
		},
	}
}

function createLocationOther(body: LocationBody, keyboard: InlineKeyboard, base: Readonly<Record<string, unknown>>) {
	return {
		...base,
		live_period: body.live_period,
		reply_markup: {
			inline_keyboard: keyboard.map(o => [...o]),
		},
	}
}

function createVenueOther(body: VenueBody, keyboard: InlineKeyboard, base: Readonly<Record<string, unknown>>) {
	return {
		...base,
		foursquare_id: body.venue.foursquare_id,
		foursquare_type: body.venue.foursquare_type,
		reply_markup: {
			inline_keyboard: keyboard.map(o => [...o]),
		},
	}
}

function createGenericOther(keyboard: InlineKeyboard, base: Readonly<Record<string, unknown>>) {
	return {
		...base,
		reply_markup: {
			inline_keyboard: keyboard.map(o => [...o]),
		},
	}
}
