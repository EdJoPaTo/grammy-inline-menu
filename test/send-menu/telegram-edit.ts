import {deepStrictEqual, rejects, strictEqual} from 'node:assert';
import {test} from 'node:test';
import type {Api, Context as BaseContext} from 'grammy';
import {MEDIA_TYPES} from '../../source/body.ts';
import {MenuTemplate} from '../../source/index.ts';
import {generateEditMessageIntoMenuFunction} from '../../source/send-menu.ts';

await test('telegram-edit text', async () => {
	const menu = new MenuTemplate<BaseContext>('whatever');

	const fakeTelegram: Partial<Api> = {
		async editMessageText(chatId, messageId, text, other) {
			strictEqual(chatId, 13);
			strictEqual(messageId, 37);
			strictEqual(text, 'whatever');
			deepStrictEqual(other, {
				disable_web_page_preview: false,
				entities: undefined,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			});
			return true;
		},
	};

	const editIntoFunction = generateEditMessageIntoMenuFunction(
		fakeTelegram as any,
		menu,
		'/',
	);

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
		},
	};

	await editIntoFunction(13, 37, fakeContext as any);
});

await test('telegram-edit text with entities', async () => {
	const menu = new MenuTemplate<BaseContext>({
		text: 'Hello world!',
		entities: [
			{
				type: 'bold',
				offset: 0,
				length: 5,
			},
			{
				type: 'italic',
				offset: 6,
				length: 5,
			},
		],
	});

	const fakeTelegram: Partial<Api> = {
		async editMessageText(chatId, messageId, text, other) {
			strictEqual(chatId, 13);
			strictEqual(messageId, 37);
			strictEqual(text, 'Hello world!');
			deepStrictEqual(other, {
				entities: [
					{
						type: 'bold',
						offset: 0,
						length: 5,
					},
					{
						type: 'italic',
						offset: 6,
						length: 5,
					},
				],
				parse_mode: undefined,
				disable_web_page_preview: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			});
			return true;
		},
	};

	const editIntoFunction = generateEditMessageIntoMenuFunction(
		fakeTelegram as any,
		menu,
		'/',
	);

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
		},
	};

	await editIntoFunction(13, 37, fakeContext as any);
});

await test('telegram-edit media', async t => {
	await Promise.all(MEDIA_TYPES.map(async mediaType =>
		t.test(mediaType, async () => {
			const menu = new MenuTemplate<BaseContext>({
				media: 'whatever',
				type: mediaType,
			});

			const fakeTelegram: Partial<Api> = {
				async editMessageMedia(chatId, messageId, media, other) {
					strictEqual(chatId, 13);
					strictEqual(messageId, 37);
					deepStrictEqual(media, {
						media: 'whatever',
						type: mediaType,
						caption: undefined,
						caption_entities: undefined,
						parse_mode: undefined,
					});
					deepStrictEqual(other, {
						reply_markup: {
							inline_keyboard: [],
						},
					});
					return true;
				},
			};

			const editIntoFunction = generateEditMessageIntoMenuFunction(
				fakeTelegram as any,
				menu,
				'/',
			);

			const fakeContext: Partial<BaseContext> = {
				callbackQuery: {
					id: '666',
					from: undefined as any,
					chat_instance: '666',
					data: '666',
				},
			};

			await editIntoFunction(13, 37, fakeContext as any);
		})));
});

await test('telegram-edit media with caption entities', async t => {
	await Promise.all(MEDIA_TYPES.map(async mediaType =>
		t.test(mediaType, async () => {
			if (!['animation', 'video'].includes(mediaType)) {
				return;
			}

			const menu = new MenuTemplate<BaseContext>({
				media: 'whatever',
				text: 'Hello world!',
				entities: [
					{
						type: 'bold',
						offset: 0,
						length: 5,
					},
					{
						type: 'italic',
						offset: 6,
						length: 5,
					},
				],
				type: mediaType,
			});

			const fakeTelegram: Partial<Api> = {
				async editMessageMedia(chatId, messageId, media, other) {
					strictEqual(chatId, 13);
					strictEqual(messageId, 37);
					deepStrictEqual(media, {
						media: 'whatever',
						type: mediaType,
						caption: 'Hello world!',
						caption_entities: [
							{
								type: 'bold',
								offset: 0,
								length: 5,
							},
							{
								type: 'italic',
								offset: 6,
								length: 5,
							},
						],
						parse_mode: undefined,
					});
					deepStrictEqual(other, {
						reply_markup: {
							inline_keyboard: [],
						},
					});
					return true;
				},
			};

			const editIntoFunction = generateEditMessageIntoMenuFunction(
				fakeTelegram as any,
				menu,
				'/',
			);

			const fakeContext: Partial<BaseContext> = {
				callbackQuery: {
					id: '666',
					from: undefined as any,
					chat_instance: '666',
					data: '666',
				},
			};

			await editIntoFunction(13, 37, fakeContext as any);
		})));
});

await test('telegram-edit location', async () => {
	const menu = new MenuTemplate<BaseContext>({
		location: {latitude: 53.5, longitude: 10},
		live_period: 666,
	});

	const editIntoFunction = generateEditMessageIntoMenuFunction(
		{} as any,
		menu,
		'/',
	);

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
		},
	};

	await rejects(
		async () => {
			await editIntoFunction(13, 37, fakeContext as any);
		},
		{
			message: /can not edit into a location body/,
		},
	);
});

await test('telegram-edit venue', async () => {
	const menu = new MenuTemplate<BaseContext>({
		venue: {
			location: {latitude: 53.5, longitude: 10},
			title: 'A',
			address: 'B',
		},
	});

	const editIntoFunction = generateEditMessageIntoMenuFunction(
		{} as any,
		menu,
		'/',
	);

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
		},
	};

	await rejects(
		async () => {
			await editIntoFunction(13, 37, fakeContext as any);
		},
		{
			message: /can not edit into a venue body/,
		},
	);
});

await test('telegram-edit invoice', async () => {
	const menu = new MenuTemplate<BaseContext>({
		invoice: {
			title: 'A',
			description: 'B',
			currency: 'EUR',
			payload: 'D',
			prices: [],
		},
	});

	const editIntoFunction = generateEditMessageIntoMenuFunction(
		{} as any,
		menu,
		'/',
	);

	const fakeContext: Partial<BaseContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			data: '666',
		},
	};

	await rejects(
		async () => {
			await editIntoFunction(13, 37, fakeContext as any);
		},
		{
			message: /can not edit into an invoice body/,
		},
	);
});
