import test from 'ava'
import type {Context as BaseContext} from 'grammy'

import {MenuTemplate} from '../../source/index.js'

// This test file also tests replyMenuToContext indirectly as its the edit fallback
import {editMenuOnContext} from '../../source/send-menu.js'

test('text reply when not a callback query', async t => {
	t.plan(2)
	const menu = new MenuTemplate<BaseContext>('whatever')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: undefined,
		async reply(text, other) {
			t.is(text, 'whatever')
			t.deepEqual(other, {
				disable_web_page_preview: false,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return undefined as any
		},
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('text reply when no message on callback query', async t => {
	t.plan(2)
	const menu = new MenuTemplate<BaseContext>('whatever')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
		},
		async reply(text, other) {
			t.is(text, 'whatever')
			t.deepEqual(other, {
				disable_web_page_preview: false,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return undefined as any
		},
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('text edit when message is a text message', async t => {
	t.plan(2)
	const menu = new MenuTemplate<BaseContext>('whatever')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'Hi Bob',
			},
		},
		async editMessageText(text, other) {
			t.is(text, 'whatever')
			t.deepEqual(other, {
				disable_web_page_preview: false,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return undefined as any
		},
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('text reply when message is a media message', async t => {
	t.plan(3)
	const menu = new MenuTemplate<BaseContext>('whatever')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				photo: [],
			},
		},
		async deleteMessage(messageId) {
			t.is(messageId, undefined)
			return true
		},
		async reply(text, other) {
			t.is(text, 'whatever')
			t.deepEqual(other, {
				disable_web_page_preview: false,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return undefined as any
		},
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('text reply when message is a media message but fails with delete', async t => {
	t.plan(2)
	const menu = new MenuTemplate<BaseContext>('whatever')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				photo: [],
			},
		},
		async deleteMessage() {
			throw new Error('whatever went wrong')
		},
		async editMessageReplyMarkup(markup) {
			t.is(markup, undefined)
			return true
		},
		async reply() {
			t.pass()
			return undefined as any
		},
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('media reply when not a callback query', async t => {
	t.plan(2)
	const menu = new MenuTemplate<BaseContext>({
		media: 'whatever',
		type: 'photo',
	})

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: undefined,
		async replyWithPhoto(photo, other) {
			t.is(photo, 'whatever')
			t.deepEqual(other, {
				caption: undefined,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return undefined as any
		},
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('media reply when text message', async t => {
	t.plan(3)
	const menu = new MenuTemplate<BaseContext>({
		media: 'whatever',
		type: 'photo',
	})

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'whatever',
			},
		},
		async deleteMessage(messageId) {
			t.is(messageId, undefined)
			return true
		},
		async replyWithPhoto(photo, other) {
			t.is(photo, 'whatever')
			t.deepEqual(other, {
				caption: undefined,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return undefined as any
		},
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('media edit when media message', async t => {
	t.plan(2)
	const menu = new MenuTemplate<BaseContext>({
		media: 'whatever',
		type: 'photo',
	})

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				photo: [],
			},
		},
		async deleteMessage(messageId) {
			t.is(messageId, undefined)
			return true
		},
		async editMessageMedia(media, other) {
			t.deepEqual(media, {
				media: 'whatever',
				type: 'photo',
				caption: undefined,
				parse_mode: undefined,
			})
			t.deepEqual(other, {
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return undefined as any
		},
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('does not throw message is not modified', async t => {
	t.plan(2)
	const menu = new MenuTemplate<BaseContext>('whatever')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'Hi Bob',
			},
		},
		async editMessageText() {
			t.pass()
			throw new Error('lalala message is not modified lalala')
		},
	}

	await t.notThrowsAsync(async () => editMenuOnContext(menu, fakeContext as any, '/'))
})

test('does throw unrecoverable edit errors', async t => {
	t.plan(2)
	const menu = new MenuTemplate<BaseContext>('whatever')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'Hi Bob',
			},
		},
		async editMessageText() {
			t.pass()
			throw new Error('something went wrong for testing')
		},
	}

	await t.throwsAsync(
		async () => editMenuOnContext(menu, fakeContext as any, '/'),
		{message: 'something went wrong for testing'},
	)
})

test('text edit without webpage preview', async t => {
	const menu = new MenuTemplate<BaseContext>({
		text: 'whatever',
		disable_web_page_preview: true,
	})

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'Hi Bob',
			},
		},
		async editMessageText(_text, other) {
			t.deepEqual(other, {
				disable_web_page_preview: true,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return undefined as any
		},
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('text edit with parse mode', async t => {
	const menu = new MenuTemplate<BaseContext>({
		text: 'whatever',
		parse_mode: 'Markdown',
	})

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'Hi Bob',
			},
		},
		async editMessageText(_text, other) {
			t.deepEqual(other, {
				disable_web_page_preview: undefined,
				parse_mode: 'Markdown',
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return undefined as any
		},
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('text edit with button', async t => {
	const menu = new MenuTemplate<BaseContext>('whatever')
	menu.manual({text: 'Button', callback_data: '/'})

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'Hi Bob',
			},
		},
		async editMessageText(_text, other) {
			t.deepEqual(other?.reply_markup, {
				inline_keyboard: [[{
					text: 'Button',
					callback_data: '/',
				}]],
			})
			return undefined as any
		},
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('media edit with button', async t => {
	const menu = new MenuTemplate<BaseContext>({
		media: 'whatever',
		type: 'photo',
	})
	menu.manual({text: 'Button', callback_data: '/'})

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				photo: [],
			},
		},
		async editMessageMedia(_media, other) {
			t.deepEqual(other?.reply_markup, {
				inline_keyboard: [[{
					text: 'Button',
					callback_data: '/',
				}]],
			})
			return undefined as any
		},
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('location reply', async t => {
	t.plan(4)
	const menu = new MenuTemplate<BaseContext>({
		location: {latitude: 53.5, longitude: 10},
		live_period: 666,
	})
	menu.manual({text: 'Button', callback_data: '/'})

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'Hi Bob',
			},
		},
		async deleteMessage(messageId) {
			t.is(messageId, undefined)
			return true
		},
		async replyWithLocation(latitude, longitude, other) {
			t.is(latitude, 53.5)
			t.is(longitude, 10)
			t.deepEqual(other, {
				live_period: 666,
				reply_markup: {
					inline_keyboard: [[{text: 'Button', callback_data: '/'}]],
				},
			})
			return undefined as any
		},
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('venue reply', async t => {
	t.plan(6)
	const menu = new MenuTemplate<BaseContext>({
		venue: {
			location: {latitude: 53.5, longitude: 10},
			title: 'A',
			address: 'B',
		},
	})
	menu.manual({text: 'Button', callback_data: '/'})

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'Hi Bob',
			},
		},
		async deleteMessage(messageId) {
			t.is(messageId, undefined)
			return true
		},
		async replyWithVenue(latitude, longitude, title, address, other) {
			t.is(latitude, 53.5)
			t.is(longitude, 10)
			t.is(title, 'A')
			t.is(address, 'B')
			t.deepEqual(other, {
				foursquare_id: undefined,
				foursquare_type: undefined,
				reply_markup: {
					inline_keyboard: [[{text: 'Button', callback_data: '/'}]],
				},
			})
			return undefined as any
		},
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('invoice reply', async t => {
	t.plan(8)
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
	menu.manual({text: 'Button', callback_data: '/'})

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'Hi Bob',
			},
		},
		async deleteMessage(messageId) {
			t.is(messageId, undefined)
			return true
		},
		async replyWithInvoice(title, description, payload, provider_token, currency, prices, other) {
			t.is(title, 'A')
			t.is(description, 'B')
			t.is(currency, 'EUR')
			t.is(payload, 'D')
			t.is(provider_token, 'E')
			t.deepEqual(prices, [])
			t.deepEqual(other, {
				reply_markup: {
					inline_keyboard: [[{text: 'Button', callback_data: '/'}]],
				},
			})
			return undefined as any
		},
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})
