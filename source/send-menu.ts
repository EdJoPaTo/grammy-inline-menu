import {Telegram, Context as TelegrafContext} from 'telegraf'
import {ExtraPhoto, ExtraReplyMessage, ExtraEditMessage, Message, InputMediaPhoto} from 'telegraf/typings/telegram-types'

import {Body, TextBody, MediaBody, isMediaBody, getBodyText, jsUserBodyHints} from './body'
import {InlineKeyboard} from './keyboard'
import {MenuLike} from './menu-like'

export type SendMenuFunc<Context> = (menu: MenuLike<Context>, context: Context, path: string) => Promise<unknown>

export async function replyMenuToContext<Context extends TelegrafContext>(menu: MenuLike<Context>, context: Context, path: string, extra: Readonly<ExtraReplyMessage> = {}): Promise<Message> {
	const body = await menu.renderBody(context, path)
	jsUserBodyHints(body)
	const keyboard = await menu.renderKeyboard(context, path)
	return replyRenderedMenuPartsToContext(body, keyboard, context, extra)
}

export async function editMenuOnContext<Context extends TelegrafContext>(menu: MenuLike<Context>, context: Context, path: string, extra: Readonly<ExtraEditMessage> = {}): Promise<void> {
	const body = await menu.renderBody(context, path)
	jsUserBodyHints(body)
	const keyboard = await menu.renderKeyboard(context, path)

	const message = context.callbackQuery?.message
	if (!message) {
		await replyRenderedMenuPartsToContext(body, keyboard, context, extra)
		return
	}

	if (isMediaBody(body)) {
		if ('animation' in message || 'audio' in message || 'document' in message || 'photo' in message || 'video' in message) {
			const media: InputMediaPhoto = {
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
	} else {
		const text = getBodyText(body)
		if (message.text) {
			await Promise.all([
				context.editMessageText(text, createTextExtra(body, keyboard, extra))
					.catch(catchMessageNotModified),
				context.answerCbQuery()
			])
			return
		}
	}

	// The current menu is incompatible: delete and reply new one
	await Promise.all([
		replyRenderedMenuPartsToContext(body, keyboard, context, extra),
		deleteMenuFromContext(context)
	])
}

export async function deleteMenuFromContext<Context extends TelegrafContext>(context: Context): Promise<void> {
	try {
		await context.deleteMessage()
	} catch {
		await context.editMessageReplyMarkup()
	}
}

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
	jsUserBodyHints(body)

	if (isMediaBody(body)) {
		const mediaExtra = createMediaExtra(body, keyboard, extra as any)

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

			default:
				throw new Error('The media body could not be replied. Either you specified the type wrong or the type is not implemented.')
		}
	}

	const text = getBodyText(body)
	if (text) {
		return context.reply(text, createTextExtra(body, keyboard, extra))
	}

	throw new Error('the body of the menu template can not be replied. It has to contain at least something replyable like text')
}

export function generateSendMenuToChatFunction<Context>(menu: MenuLike<Context>, path: string): (telegram: Readonly<Telegram>, chatId: string | number, context: Context, extra?: Readonly<ExtraReplyMessage>) => Promise<Message> {
	return async (telegram, chatId, context, extra = {}) => {
		const body = await menu.renderBody(context, path)
		jsUserBodyHints(body)
		const keyboard = await menu.renderKeyboard(context, path)

		if (isMediaBody(body)) {
			const mediaExtra = createMediaExtra(body, keyboard, extra as any)

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

				default:
					throw new Error('The media body could not be sent. Either you specified the type wrong or the type is not implemented.')
			}
		}

		const text = getBodyText(body)
		if (text) {
			return telegram.sendMessage(chatId, text, createTextExtra(body, keyboard, extra))
		}

		throw new Error('the body of the menu template can not be replied. It has to contain at least something replyable like text')
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
