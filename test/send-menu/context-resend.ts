import test from 'ava'
import {Context as BaseContext} from 'grammy'

import {MenuTemplate} from '../../source'

import {resendMenuToContext} from '../../source/send-menu'

test('resend on callback query', async t => {
	t.plan(3)
	const menu = new MenuTemplate<BaseContext>('whatever')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
		},
		deleteMessage: async messageId => {
			t.is(messageId, undefined)
			return true
		},
		reply: async (text, other) => {
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

	await resendMenuToContext(menu, fakeContext as any, '/')
})

test('resend on whatever', async t => {
	t.plan(3)
	const menu = new MenuTemplate<BaseContext>('whatever')

	const fakeContext: Partial<BaseContext> = {
		deleteMessage: async messageId => {
			t.is(messageId, undefined)
			return true
		},
		reply: async (text, other) => {
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

	await resendMenuToContext(menu, fakeContext as any, '/')
})
