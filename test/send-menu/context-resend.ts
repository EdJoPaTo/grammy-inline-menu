import {deepStrictEqual, strictEqual} from 'node:assert'
import {test} from 'node:test'
import type {Context as BaseContext} from 'grammy'
import {MenuTemplate} from '../../source/index.js'
import {resendMenuToContext} from '../../source/send-menu.js'

await test('context-resend on callback query', async t => {
	const deleteMessage = t.mock.fn<BaseContext['deleteMessage']>(
		async messageId => {
			strictEqual(messageId, undefined)
			return true
		},
	)
	const reply = t.mock.fn<BaseContext['reply']>(async (text, other) => {
		strictEqual(text, 'whatever')
		deepStrictEqual(other, {
			disable_web_page_preview: false,
			parse_mode: undefined,
			reply_markup: {
				inline_keyboard: [],
			},
		})
		return undefined as any
	})

	const menu = new MenuTemplate<BaseContext>('whatever')

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
		},
		deleteMessage,
		reply,
	}

	await resendMenuToContext(menu, fakeContext as any, '/')
	strictEqual(deleteMessage.mock.callCount(), 1)
	strictEqual(reply.mock.callCount(), 1)
})

await test('context-resend on whatever', async t => {
	const deleteMessage = t.mock.fn<BaseContext['deleteMessage']>(
		async messageId => {
			strictEqual(messageId, undefined)
			return true
		},
	)
	const reply = t.mock.fn<BaseContext['reply']>(async (text, other) => {
		strictEqual(text, 'whatever')
		deepStrictEqual(other, {
			disable_web_page_preview: false,
			parse_mode: undefined,
			reply_markup: {
				inline_keyboard: [],
			},
		})
		return undefined as any
	})

	const menu = new MenuTemplate<BaseContext>('whatever')

	const fakeContext: Partial<BaseContext> = {
		deleteMessage,
		reply,
	}

	await resendMenuToContext(menu, fakeContext as any, '/')
	strictEqual(deleteMessage.mock.callCount(), 1)
	strictEqual(reply.mock.callCount(), 1)
})
