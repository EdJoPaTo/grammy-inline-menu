import {deepStrictEqual, strictEqual} from 'node:assert';
import {test} from 'node:test';
import type {Context as BaseContext} from 'grammy';
import {MEDIA_TYPES} from '../../source/body.js';
import {MenuTemplate} from '../../source/index.js';
import {replyMenuToContext} from '../../source/send-menu.js';

await test('context-reply media', async t => {
	await Promise.all(MEDIA_TYPES.map(async mediaType =>
		t.test(mediaType, async t => {
			const menu = new MenuTemplate<BaseContext>({
				media: 'whatever',
				type: mediaType,
			});

			const replyFunction = t.mock.fn(async (media: unknown, other: unknown) => {
				strictEqual(media, 'whatever');
				deepStrictEqual(other, {
					caption: undefined,
					caption_entities: undefined,
					parse_mode: undefined,
					reply_markup: {
						inline_keyboard: [],
					},
				});
				return undefined as any;
			});

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
			};

			await replyMenuToContext(menu, fakeContext as any, '/');
			strictEqual(replyFunction.mock.callCount(), 1);
		})));
});
