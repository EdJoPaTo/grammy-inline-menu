import {Telegram, Context as TelegrafContext} from 'telegraf'
import {ExtraPhoto, ExtraReplyMessage, ExtraEditMessage, Message, MessageMedia} from 'telegraf/typings/telegram-types'

import {Body, TextBody, MediaBody, isMediaBody, isTextBody, getBodyText} from './body'
import {InlineKeyboard} from './keyboard'
import {MenuLike} from './menu-like'

/**
 * Generic Method which is able to send a menu to a context (given a path where it is)
 */
export type SendMenuFunc<Context> = (menu: MenuLike<Context>, context: Context, path: string) => Promise<unknown>

/**
 * Method which is able to send a menu to a chat.
 * Generated via `generateSendMenuToChatFunction`.
 */
export type SendMenuToChatFunction<Context> = (chatId: string | number, context: Context, extra?: Readonly<ExtraReplyMessage>) => Promise<Message>

/**
 * Method which is able to edit a message in a chat into a menu.
 * Generated via `generateEditMessageIntoMenuFunction`.
 */
export type EditMessageIntoMenuFunction<Context> = (chatId: number | string, messageId: number, context: Context, extra?: Readonly<ExtraEditMessage>) => Promise<Message | boolean>

/**
 * Reply a menu to a context as a new message
 * @param menu menu to be shown
 * @param context current Telegraf context to reply the menu to it
 * @param path path of the menu
 * @param extra optional additional Telegraf Extra options
 */
export async function replyMenuToContext<Context extends TelegrafContext>(menu: MenuLike<Context>, context: Context, path: string, extra: Readonly<ExtraReplyMessage> = {}): Promise<Message> {
	const body = await menu.renderBody(context, path)
	const keyboard = await menu.renderKeyboard(context, path)
	const message = await replyRenderedMenuPartsToContext(body, keyboard, context, extra)

	if (context.callbackQuery) {
		await context.answerCbQuery()
	}

	return message
}

/**
 * Edit the context into the menu. If thats not possible the current message is deleted and a new message is replied
 * @param menu menu to be shown
 * @param context current Telegraf context to edit the menu into
 * @param path path of the menu
 * @param extra optional additional Telegraf Extra options
 */
export async function editMenuOnContext<Context extends TelegrafContext>(menu: MenuLike<Context>, context: Context, path: string, extra: Readonly<ExtraEditMessage> = {}): Promise<void> {
	const body = await menu.renderBody(context, path)
	const keyboard = await menu.renderKeyboard(context, path)

	const message = context.callbackQuery?.message
	if (!message) {
		await replyRenderedMenuPartsToContext(body, keyboard, context, extra)

		if (context.callbackQuery) {
			await context.answerCbQuery()
		}

		return
	}

	if (isMediaBody(body)) {
		if ('animation' in message || 'audio' in message || 'document' in message || 'photo' in message || 'video' in message) {
			const media: MessageMedia = {
				type: body.type,
				media: body.media,
				caption: body.text,
				parse_mode: body.parse_mode
			}

			await Promise.all([
				context.editMessageMedia(media, createMediaExtra(body, keyboard, extra as any))
					.catch(catchMessageNotModified),
				context.answerCbQuery()
			])
			return
		}
	} else if (isTextBody(body)) {
		const text = getBodyText(body)
		if (message.text) {
			await Promise.all([
				context.editMessageText(text, createTextExtra(body, keyboard, extra))
					.catch(catchMessageNotModified),
				context.answerCbQuery()
			])
			return
		}
	} else {
		throw new TypeError('The body has to be a string or an object containing text or media. Check the telegraf-inline-menu Documentation.')
	}

	// The current menu is incompatible: delete and reply new one
	await Promise.all([
		replyRenderedMenuPartsToContext(body, keyboard, context, extra),
		context.answerCbQuery(),
		deleteMenuFromContext(context)
	])
}

/**
 * Delete the message on the context.
 * If thats not possible the reply markup (keyboard) is removed. The user can not press any buttons on that old message.
 * @param context context of the message to be deleted
 */
export async function deleteMenuFromContext<Context extends TelegrafContext>(context: Context): Promise<void> {
	try {
		await context.deleteMessage()
	} catch {
		await context.editMessageReplyMarkup(undefined)
	}
}

/**
 * Deletes to menu of the current context and replies a new one ensuring the menu is at the end of the chat.
 * @param menu menu to be shown
 * @param context current Telegraf context to send the menu to
 * @param path path of the menu
 * @param extra optional additional Telegraf Extra options
 */
export async function resendMenuToContext<Context extends TelegrafContext>(menu: MenuLike<Context>, context: Context, path: string, extra: Readonly<ExtraReplyMessage> = {}): Promise<Message> {
	const [menuMessage] = await Promise.all([
		replyMenuToContext(menu, context, path, extra),
		deleteMenuFromContext(context)
	])
	return menuMessage
}

function catchMessageNotModified(error: any): void {
	if (error instanceof Error && error.message.includes('message is not modified')) {
		// ignore
		return
	}

	throw error
}

async function replyRenderedMenuPartsToContext<Context extends TelegrafContext>(body: Body, keyboard: InlineKeyboard, context: Context, extra: Readonly<ExtraReplyMessage>): Promise<Message> {
	if (isMediaBody(body)) {
		const mediaExtra = createMediaExtra(body, keyboard, extra as any)

		// eslint-disable-next-line default-case
		switch (body.type) {
			case 'animation':
				// TODO: use typings when PR is merged https://github.com/telegraf/telegraf/pull/1042
				return (context as any).replyWithAnimation(body.media, mediaExtra)
			case 'audio':
				return context.replyWithAudio(body.media, mediaExtra)
			case 'document':
				return context.replyWithDocument(body.media, mediaExtra)
			case 'photo':
				return context.replyWithPhoto(body.media, mediaExtra)
			case 'video':
				return context.replyWithVideo(body.media, mediaExtra)
		}
	}

	if (isTextBody(body)) {
		const text = getBodyText(body)
		return context.reply(text, createTextExtra(body, keyboard, extra))
	}

	throw new Error('The body has to be a string or an object containing text or media. Check the telegraf-inline-menu Documentation.')
}

/**
 * Generate a function to send the menu towards a chat from external events
 * @param telegram The Telegram object to do the API calls with later on
 * @param menu menu to be shown
 * @param path path of the menu
 */
export function generateSendMenuToChatFunction<Context>(telegram: Readonly<Telegram>, menu: MenuLike<Context>, path: string): SendMenuToChatFunction<Context> {
	return async (chatId, context, extra = {}) => {
		const body = await menu.renderBody(context, path)
		const keyboard = await menu.renderKeyboard(context, path)

		if (isMediaBody(body)) {
			const mediaExtra = createMediaExtra(body, keyboard, extra as any)

			// eslint-disable-next-line default-case
			switch (body.type) {
				case 'animation':
					return telegram.sendAnimation(chatId, body.media, mediaExtra)
				case 'audio':
					return telegram.sendAudio(chatId, body.media, mediaExtra)
				case 'document':
					return telegram.sendDocument(chatId, body.media, mediaExtra)
				case 'photo':
					return telegram.sendPhoto(chatId, body.media, mediaExtra)
				case 'video':
					return telegram.sendVideo(chatId, body.media, mediaExtra)
			}
		}

		if (isTextBody(body)) {
			const text = getBodyText(body)
			return telegram.sendMessage(chatId, text, createTextExtra(body, keyboard, extra))
		}

		throw new Error('The body has to be a string or an object containing text or media. Check the telegraf-inline-menu Documentation.')
	}
}

/**
 * Edit the message into the the menu.
 * This fails when the current message is not compatible with the menu (you cant edit a media message into a text message and vice versa)
 * @param telegram The Telegram object to do the API calls with later on
 * @param menu menu to be shown
 * @param path path of the menu
 */
export function generateEditMessageIntoMenuFunction<Context>(telegram: Readonly<Telegram>, menu: MenuLike<Context>, path: string): EditMessageIntoMenuFunction<Context> {
	return async (chatId, messageId, context, extra = {}) => {
		const body = await menu.renderBody(context, path)
		const keyboard = await menu.renderKeyboard(context, path)

		if (isMediaBody(body)) {
			const media: MessageMedia = {
				type: body.type,
				media: body.media,
				caption: body.text,
				parse_mode: body.parse_mode
			}

			const mediaExtra = createMediaExtra(body, keyboard, extra as any)
			// TODO: use typings when PR is merged https://github.com/telegraf/telegraf/pull/1053
			return (telegram as any).editMessageMedia(chatId, messageId, undefined, media, mediaExtra)
		}

		if (isTextBody(body)) {
			const text = getBodyText(body)
			return telegram.editMessageText(chatId, messageId, undefined, text, extra)
		}

		throw new Error('The body has to be a string or an object containing text or media. Check the telegraf-inline-menu Documentation.')
	}
}

function createTextExtra(body: string | TextBody, keyboard: InlineKeyboard, base: Readonly<ExtraReplyMessage>): ExtraReplyMessage {
	return {
		...base,
		parse_mode: typeof body === 'string' ? undefined : body.parse_mode,
		disable_web_page_preview: typeof body !== 'string' && body.disable_web_page_preview,
		reply_markup: {
			inline_keyboard: keyboard.map(o => [...o])
		}
	}
}

function createMediaExtra(body: MediaBody, keyboard: InlineKeyboard, base: Readonly<ExtraPhoto>): ExtraPhoto {
	return {
		...base,
		parse_mode: body.parse_mode,
		caption: body.text,
		reply_markup: {
			inline_keyboard: keyboard.map(o => [...o])
		}
	}
}
