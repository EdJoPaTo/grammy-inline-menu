import {Context as BaseContext, Api} from 'grammy'
import test from 'ava'

import {MenuTemplate} from '../../source'
import {MEDIA_TYPES} from '../../source/body'

import {generateEditMessageIntoMenuFunction} from '../../source/send-menu'

test('text', async t => {
	const menu = new MenuTemplate<BaseContext>('whatever')

	const fakeTelegram: Partial<Api> = {
		editMessageText: async (chatId, messageId, text, other) => {
			t.is(chatId, 13)
			t.is(messageId, 37)
			t.is(text, 'whatever')
			t.deepEqual(other, {
				disable_web_page_preview: false,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return Promise.resolve(true)
		},
	}

	const editIntoFunction = generateEditMessageIntoMenuFunction(fakeTelegram as any, menu, '/')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
		},
	}

	await editIntoFunction(13, 37, fakeContext as any)
})

for (const mediaType of MEDIA_TYPES) {
	test('media ' + mediaType, async t => {
		const menu = new MenuTemplate<BaseContext>({media: 'whatever', type: mediaType})

		const fakeTelegram: Partial<Api> = {
			editMessageMedia: async (chatId, messageId, media, other) => {
				t.is(chatId, 13)
				t.is(messageId, 37)
				t.deepEqual(media, {
					media: 'whatever',
					type: mediaType,
					caption: undefined,
					parse_mode: undefined,
				})
				t.deepEqual(other, {
					reply_markup: {
						inline_keyboard: [],
					},
				})
				return Promise.resolve(true)
			},
		}

		const editIntoFunction = generateEditMessageIntoMenuFunction(fakeTelegram as any, menu, '/')

		const fakeContext: Partial<BaseContext> = {
			callbackQuery: {
				id: '666',
				from: undefined as any,
				chat_instance: '666',
				data: '666',
			},
		}

		await editIntoFunction(13, 37, fakeContext as any)
	})
}

test('location', async t => {
	const menu = new MenuTemplate<BaseContext>({location: {latitude: 53.5, longitude: 10}, live_period: 666})

	const editIntoFunction = generateEditMessageIntoMenuFunction({} as any, menu, '/')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
		},
	}

	await t.throwsAsync(async () => {
		await editIntoFunction(13, 37, fakeContext as any)
	}, {
		message: /can not edit into a location body/,
	})
})

test('venue', async t => {
	const menu = new MenuTemplate<BaseContext>({venue: {location: {latitude: 53.5, longitude: 10}, title: 'A', address: 'B'}})

	const editIntoFunction = generateEditMessageIntoMenuFunction({} as any, menu, '/')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
		},
	}

	await t.throwsAsync(async () => {
		await editIntoFunction(13, 37, fakeContext as any)
	}, {
		message: /can not edit into a venue body/,
	})
})

test('invoice', async t => {
	const menu = new MenuTemplate<BaseContext>({invoice: {
		title: 'A',
		description: 'B',
		currency: 'EUR',
		payload: 'D',
		provider_token: 'E',
		prices: [],
	}})

	const editIntoFunction = generateEditMessageIntoMenuFunction({} as any, menu, '/')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
		},
	}

	await t.throwsAsync(async () => {
		await editIntoFunction(13, 37, fakeContext as any)
	}, {
		message: /can not edit into an invoice body/,
	})
})
