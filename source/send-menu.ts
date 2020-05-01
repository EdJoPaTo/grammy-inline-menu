import {Telegram, Context as TelegrafContext} from 'telegraf'
import {ExtraPhoto, ExtraReplyMessage, ExtraEditMessage, Message, InputMediaPhoto} from 'telegraf/typings/telegram-types'

import {Body, TextBody, PhotoBody, isPhotoBody, getBodyText} from './body'
import {MenuLike, InlineKeyboard} from './menu-like'

export async function replyMenuToContext<Context extends TelegrafContext>(menu: MenuLike<Context>, context: Context, path: string, extra: Readonly<ExtraReplyMessage> = {}): Promise<Message> {
	const body = await menu.renderBody(context, path)
	const keyboard = await menu.renderKeyboard(context, path)
	return replyRenderedMenuPartsToContext(body, keyboard, context, extra)
}

export async function editMenuOnContext<Context extends TelegrafContext>(menu: MenuLike<Context>, context: Context, path: string, extra: Readonly<ExtraEditMessage> = {}): Promise<void> {
	const body = await menu.renderBody(context, path)
	const keyboard = await menu.renderKeyboard(context, path)

	const message = context.callbackQuery?.message
	if (!message) {
		await replyRenderedMenuPartsToContext(body, keyboard, context, extra)
		return
	}

	if (isPhotoBody(body)) {
		if (message.photo) {
			const media: InputMediaPhoto = {
				type: 'photo',
				media: body.photo,
				caption: body.text
			}

			await Promise.all([
				context.editMessageMedia(media, createPhotoExtra(body, keyboard, extra as any))
					.catch(catchMessageNotModified),
				context.answerCbQuery()
			])
			return
		}
	} else if (getBodyText(body)) {
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
		context.deleteMessage()
			.catch(() => { /* TODO: maybe try to remove keyboard from the old message? */ })
	])
}

function catchMessageNotModified(error: any): void {
	if (error instanceof Error && error.message.includes('message is not modified')) {
		// ignore
		return
	}

	throw error
}

async function replyRenderedMenuPartsToContext<Context extends TelegrafContext>(body: Body, keyboard: InlineKeyboard, context: Context, extra: Readonly<ExtraReplyMessage>): Promise<Message> {
	if (isPhotoBody(body)) {
		return context.replyWithPhoto(body.photo, createPhotoExtra(body, keyboard, extra as any))
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
		const keyboard = await menu.renderKeyboard(context, path)

		if (isPhotoBody(body)) {
			return telegram.sendPhoto(chatId, body.photo, createPhotoExtra(body, keyboard, extra as any))
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
		reply_markup: {
			inline_keyboard: keyboard.map(o => [...o])
		}
	}
}

function createPhotoExtra(body: PhotoBody, keyboard: InlineKeyboard, base: Readonly<ExtraPhoto>): ExtraPhoto {
	return {
		...base,
		parse_mode: body.parse_mode,
		caption: body.text,
		reply_markup: {
			inline_keyboard: keyboard.map(o => [...o])
		}
	}
}
