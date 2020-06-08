import test from 'ava'
import {TelegrafContext} from 'telegraf/typings/context'

import {MenuTemplate} from '../../source'
import {MEDIA_TYPES} from '../../source/body'

import {replyMenuToContext} from '../../source/send-menu'

for (const mediaType of MEDIA_TYPES) {
	test('reply media ' + mediaType, async t => {
		t.plan(2)
		const menu = new MenuTemplate<TelegrafContext>({media: 'whatever', type: mediaType})

		const replyFunction = async (media: unknown, extra: unknown) => {
			t.is(media, 'whatever')
			t.deepEqual(extra, {
				caption: undefined,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: []
				}
			})
			return Promise.resolve(undefined as any)
		}

		const fakeContext: Partial<TelegrafContext> = {
			callbackQuery: {
				id: '666',
				from: undefined as any,
				chat_instance: '666'
			},
			replyWithAudio: replyFunction,
			replyWithDocument: replyFunction,
			replyWithPhoto: replyFunction,
			replyWithVideo: replyFunction
		}

		// TODO: use typings when PR is merged https://github.com/telegraf/telegraf/pull/1042
		const fakeContextAny = fakeContext as any
		fakeContextAny.replyWithAnimation = replyFunction

		await replyMenuToContext(menu, fakeContext as any, '/')
	})
}
