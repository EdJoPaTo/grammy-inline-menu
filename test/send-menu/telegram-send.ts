import test from 'ava'
import type {Api, Context as BaseContext} from 'grammy'
import {MenuTemplate} from '../../source/index.js'
import {MEDIA_TYPES} from '../../source/body.js'
import {generateSendMenuToChatFunction} from '../../source/send-menu.js'

test('text', async t => {
	const menu = new MenuTemplate<BaseContext>('whatever')

	const fakeTelegram: Partial<Api> = {
		async sendMessage(chatId, text, other) {
			t.is(chatId, 666)
			t.is(text, 'whatever')
			t.deepEqual(other, {
				disable_web_page_preview: false,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return {} as any
		},
	}

	const sendMenu = generateSendMenuToChatFunction(fakeTelegram as any, menu, '/')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
		},
	}

	await sendMenu(666, fakeContext as any)
})

for (const mediaType of MEDIA_TYPES) {
	test('media ' + mediaType, async t => {
		const menu = new MenuTemplate<BaseContext>({
			media: 'whatever',
			type: mediaType,
		})

		const sendFunction = async (chatId: unknown, media: unknown, other: unknown) => {
			t.is(chatId, 666)
			t.is(media, 'whatever')
			t.deepEqual(other, {
				caption: undefined,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return {} as any
		}

		const fakeTelegram: Partial<Api> = {
			sendAnimation: sendFunction,
			sendAudio: sendFunction,
			sendDocument: sendFunction,
			sendPhoto: sendFunction,
			sendVideo: sendFunction,
		}

		const sendMenu = generateSendMenuToChatFunction(fakeTelegram as any, menu, '/')

		const fakeContext: Partial<BaseContext> = {
			callbackQuery: {
				id: '666',
				from: undefined as any,
				chat_instance: '666',
				data: '666',
			},
		}

		await sendMenu(666, fakeContext as any)
	})
}

test('location', async t => {
	const menu = new MenuTemplate<BaseContext>({
		location: {latitude: 53.5, longitude: 10},
		live_period: 666,
	})

	const fakeTelegram: Partial<Api> = {
		async sendLocation(chatId, latitude, longitude, other) {
			t.is(chatId, 666)
			t.is(latitude, 53.5)
			t.is(longitude, 10)
			t.deepEqual(other, {
				live_period: 666,
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return {} as any
		},
	}

	const sendMenu = generateSendMenuToChatFunction(fakeTelegram as any, menu, '/')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
		},
	}

	await sendMenu(666, fakeContext as any)
})

test('venue', async t => {
	const menu = new MenuTemplate<BaseContext>({
		venue: {
			location: {latitude: 53.5, longitude: 10},
			title: 'A',
			address: 'B',
		},
	})

	const fakeTelegram: Partial<Api> = {
		async sendVenue(chatId, latitude, longitude, title, address, other) {
			t.is(chatId, 666)
			t.is(latitude, 53.5)
			t.is(longitude, 10)
			t.is(title, 'A')
			t.is(address, 'B')
			t.deepEqual(other, {
				foursquare_id: undefined,
				foursquare_type: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return {} as any
		},
	}

	const sendMenu = generateSendMenuToChatFunction(fakeTelegram as any, menu, '/')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
		},
	}

	await sendMenu(666, fakeContext as any)
})

test('invoice', async t => {
	const menu = new MenuTemplate<BaseContext>({
		invoice: {
			title: 'A',
			description: 'B',
			currency: 'EUR',
			payload: 'D',
			provider_token: 'E',
			prices: [],
		},
	})

	const fakeTelegram: Partial<Api> = {
		async sendInvoice(chatId, title, description, payload, provider_token, currency, prices, other) {
			t.is(chatId, 666)
			t.is(title, 'A')
			t.is(description, 'B')
			t.is(currency, 'EUR')
			t.is(payload, 'D')
			t.is(provider_token, 'E')
			t.deepEqual(prices, [])
			t.deepEqual(other, {
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return {} as any
		},
	}

	const sendMenu = generateSendMenuToChatFunction(fakeTelegram as any, menu, '/')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
		},
	}

	await sendMenu(666, fakeContext as any)
})
