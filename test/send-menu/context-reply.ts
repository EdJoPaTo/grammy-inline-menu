import test from 'ava'
import type {Context as BaseContext} from 'grammy'
import {MEDIA_TYPES} from '../../source/body.js'
import {MenuTemplate} from '../../source/index.js'
import {replyMenuToContext} from '../../source/send-menu.js'

for (const mediaType of MEDIA_TYPES) {
	test('reply media ' + mediaType, async t => {
		t.plan(2)
		const menu = new MenuTemplate<BaseContext>({
			media: 'whatever',
			type: mediaType,
		})

		const replyFunction = async (media: unknown, other: unknown) => {
			t.is(media, 'whatever')
			t.deepEqual(other, {
				caption: undefined,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			})
			return undefined as any
		}

		const fakeContext: Partial<BaseContext> = {
			callbackQuery: {
				id: '666',
				from: undefined as any,
				chat_instance: '666',
				data: '666',
			},
			replyWithAnimation: replyFunction,
			replyWithAudio: replyFunction,
			replyWithDocument: replyFunction,
			replyWithPhoto: replyFunction,
			replyWithVideo: replyFunction,
		}

		await replyMenuToContext(menu, fakeContext as any, '/')
	})
}
