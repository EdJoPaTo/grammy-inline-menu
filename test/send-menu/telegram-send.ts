import {TelegrafContext} from 'telegraf/typings/context'
import {Telegram} from 'telegraf'
import test from 'ava'

import {MenuTemplate} from '../../source'
import {MEDIA_TYPES} from '../../source/body'

import {generateSendMenuToChatFunction} from '../../source/send-menu'

test('text', async t => {
	const menu = new MenuTemplate<TelegrafContext>('whatever')

	const fakeTelegram: Partial<Telegram> = {
		sendMessage: async (chatId, text, extra) => {
			t.is(chatId, 666)
			t.is(text, 'whatever')
			t.deepEqual(extra, {
				disable_web_page_preview: false,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: []
				}
			})
			return Promise.resolve({} as any)
		}
	}

	const sendMenu = generateSendMenuToChatFunction(fakeTelegram as any, menu, '/')

	const fakeContext: Partial<TelegrafContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666'
		}
	}

	await sendMenu(666, fakeContext as any)
})

for (const mediaType of MEDIA_TYPES) {
	test('media ' + mediaType, async t => {
		const menu = new MenuTemplate<TelegrafContext>({media: 'whatever', type: mediaType})

		const sendFunction = async (chatId: unknown, media: unknown, extra: unknown) => {
			t.is(chatId, 666)
			t.is(media, 'whatever')
			t.deepEqual(extra, {
				caption: undefined,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: []
				}
			})
			return Promise.resolve({} as any)
		}

		const fakeTelegram: Partial<Telegram> = {
			sendAnimation: sendFunction,
			sendAudio: sendFunction,
			sendDocument: sendFunction,
			sendPhoto: sendFunction,
			sendVideo: sendFunction
		}

		const sendMenu = generateSendMenuToChatFunction(fakeTelegram as any, menu, '/')

		const fakeContext: Partial<TelegrafContext> = {
			callbackQuery: {
				id: '666',
				from: undefined as any,
				chat_instance: '666'
			}
		}

		await sendMenu(666, fakeContext as any)
	})
}
