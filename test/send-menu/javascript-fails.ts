import test from 'ava'
import type {Context as BaseContext} from 'grammy'
import {MenuTemplate} from '../../source/index.js'
import {
	editMenuOnContext,
	generateEditMessageIntoMenuFunction,
	generateSendMenuToChatFunction,
	replyMenuToContext,
} from '../../source/send-menu.js'

const EXPECTED_ERROR = {
	message: /The body has to be a string or an object containing text or media/,
}

const FAULTY_MENU_TEMPLATES: Readonly<Record<string, MenuTemplate<unknown>>> = {
	// @ts-expect-error
	'empty body object': new MenuTemplate({}),
	'empty string body': new MenuTemplate(''),
	// @ts-expect-error
	'wrong media type': new MenuTemplate({media: 'bla', type: 'banana'}),
	'text in location body': new MenuTemplate({
		location: {latitude: 53.5, longitude: 10},
		text: '42',
	}),
	'text in venue body': new MenuTemplate({
		venue: {
			location: {latitude: 53.5, longitude: 10},
			title: 'A',
			address: 'B',
		},
		text: '42',
	}),
	'missing address in venue body': new MenuTemplate({
		// @ts-expect-error
		venue: {location: {latitude: 53.5, longitude: 10}, title: 'A'},
	}),
	'missing title in venue body': new MenuTemplate({
		// @ts-expect-error
		venue: {location: {latitude: 53.5, longitude: 10}, address: 'B'},
	}),
}

for (const [fault, menu] of Object.entries(FAULTY_MENU_TEMPLATES)) {
	test('context edit ' + fault, async t => {
		const fakeContext: Partial<BaseContext> = {
			callbackQuery: {
				id: '666',
				chat_instance: '666',
				from: {} as any,
				data: '666',
				message: {
					text: '42',
					date: 666,
					message_id: 666,
					chat: {} as any,
				},
			},
		}
		await t.throwsAsync(
			async () => editMenuOnContext(menu, fakeContext as any, '/'),
			EXPECTED_ERROR,
		)
	})
}

for (const [fault, menu] of Object.entries(FAULTY_MENU_TEMPLATES)) {
	test('context reply ' + fault, async t => {
		await t.throwsAsync(
			async () => replyMenuToContext(menu, {} as any, '/'),
			EXPECTED_ERROR,
		)
	})
}

for (const [fault, menu] of Object.entries(FAULTY_MENU_TEMPLATES)) {
	test('telegram send ' + fault, async t => {
		const sendMenu = generateSendMenuToChatFunction({} as any, menu, '/')
		await t.throwsAsync(
			async () => sendMenu(666, {} as any),
			EXPECTED_ERROR,
		)
	})
}

for (const [fault, menu] of Object.entries(FAULTY_MENU_TEMPLATES)) {
	test('telegram edit ' + fault, async t => {
		const editIntoMenu = generateEditMessageIntoMenuFunction(
			{} as any,
			menu,
			'/',
		)
		await t.throwsAsync(
			async () => editIntoMenu(666, 666, {} as any),
			EXPECTED_ERROR,
		)
	})
}
