import test from 'ava'
import {TelegrafContext} from 'telegraf/typings/context'

import {editMenuOnContext, replyMenuToContext, generateSendMenuToChatFunction, generateEditMessageIntoMenuFunction} from '../../source/send-menu'
import {MenuTemplate} from '../../source'

const EXPECTED_ERROR = {message: /The body has to be a string or an object containing text or media/}

const FAULTY_MENU_TEMPLATES: Readonly<Record<string, MenuTemplate<unknown>>> = {
	// @ts-expect-error
	'empty body object': new MenuTemplate({}),
	'empty string body': new MenuTemplate(''),
	// @ts-expect-error
	'wrong media type': new MenuTemplate({media: 'bla', type: 'banana'})
}

for (const fault of Object.keys(FAULTY_MENU_TEMPLATES)) {
	test('context edit ' + fault, async t => {
		const menu = FAULTY_MENU_TEMPLATES[fault]
		const fakeContext: Partial<TelegrafContext> = {
			callbackQuery: {
				id: '666',
				chat_instance: '666',
				from: {} as any,
				message: {
					date: 666,
					message_id: 666,
					chat: {} as any
				}
			}
		}
		await t.throwsAsync(
			async () => editMenuOnContext(menu, fakeContext as any, '/'),
			EXPECTED_ERROR
		)
	})
}

for (const fault of Object.keys(FAULTY_MENU_TEMPLATES)) {
	test('context reply ' + fault, async t => {
		const menu = FAULTY_MENU_TEMPLATES[fault]
		await t.throwsAsync(
			async () => replyMenuToContext(menu, {} as any, '/'),
			EXPECTED_ERROR
		)
	})
}

for (const fault of Object.keys(FAULTY_MENU_TEMPLATES)) {
	test('telegram send ' + fault, async t => {
		const menu = FAULTY_MENU_TEMPLATES[fault]
		const sendMenu = generateSendMenuToChatFunction({} as any, menu, '/')
		await t.throwsAsync(
			async () => sendMenu(666, {} as any),
			EXPECTED_ERROR
		)
	})
}

for (const fault of Object.keys(FAULTY_MENU_TEMPLATES)) {
	test('telegram edit ' + fault, async t => {
		const menu = FAULTY_MENU_TEMPLATES[fault]
		const editIntoMenu = generateEditMessageIntoMenuFunction({} as any, menu, '/')
		await t.throwsAsync(
			async () => editIntoMenu(666, 666, {} as any),
			EXPECTED_ERROR
		)
	})
}
