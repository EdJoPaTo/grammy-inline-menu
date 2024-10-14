import {deepStrictEqual, strictEqual} from 'node:assert';
import {test} from 'node:test';
import type {Api, Context as BaseContext} from 'grammy';
import {MEDIA_TYPES} from '../../source/body.js';
import {MenuTemplate} from '../../source/index.js';
import {generateSendMenuToChatFunction} from '../../source/send-menu.js';

await test('telegram-send text', async () => {
	const menu = new MenuTemplate<BaseContext>('whatever');

	const fakeTelegram: Partial<Api> = {
		async sendMessage(chatId, text, other) {
			strictEqual(chatId, 666);
			strictEqual(text, 'whatever');
			deepStrictEqual(other, {
				disable_web_page_preview: false,
				entities: undefined,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			});
			return {} as any;
		},
	};

	const sendMenu = generateSendMenuToChatFunction(
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

	await sendMenu(666, fakeContext as any);
});

await test('telegram-send media', async t => {
	await Promise.all(
		MEDIA_TYPES.map(async mediaType =>
			t.test(mediaType, async () => {
				const menu = new MenuTemplate<BaseContext>({
					media: 'whatever',
					type: mediaType,
				});

				const sendFunction = async (
					chatId: unknown,
					media: unknown,
					other: unknown,
				) => {
					strictEqual(chatId, 666);
					strictEqual(media, 'whatever');
					deepStrictEqual(other, {
						caption: undefined,
						caption_entities: undefined,
						parse_mode: undefined,
						reply_markup: {
							inline_keyboard: [],
						},
					});
					return {} as any;
				};

				const fakeTelegram: Partial<Api> = {
					sendAnimation: sendFunction,
					sendAudio: sendFunction,
					sendDocument: sendFunction,
					sendPhoto: sendFunction,
					sendVideo: sendFunction,
				};

				const sendMenu = generateSendMenuToChatFunction(
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

				await sendMenu(666, fakeContext as any);
			}),
		),
	);
});

await test('telegram-send location', async () => {
	const menu = new MenuTemplate<BaseContext>({
		location: {latitude: 53.5, longitude: 10},
		live_period: 666,
	});

	const fakeTelegram: Partial<Api> = {
		async sendLocation(chatId, latitude, longitude, other) {
			strictEqual(chatId, 666);
			strictEqual(latitude, 53.5);
			strictEqual(longitude, 10);
			deepStrictEqual(other, {
				live_period: 666,
				reply_markup: {
					inline_keyboard: [],
				},
			});
			return {} as any;
		},
	};

	const sendMenu = generateSendMenuToChatFunction(
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

	await sendMenu(666, fakeContext as any);
});

await test('telegram-send venue', async () => {
	const menu = new MenuTemplate<BaseContext>({
		venue: {
			location: {latitude: 53.5, longitude: 10},
			title: 'A',
			address: 'B',
		},
	});

	const fakeTelegram: Partial<Api> = {
		async sendVenue(chatId, latitude, longitude, title, address, other) {
			strictEqual(chatId, 666);
			strictEqual(latitude, 53.5);
			strictEqual(longitude, 10);
			strictEqual(title, 'A');
			strictEqual(address, 'B');
			deepStrictEqual(other, {
				foursquare_id: undefined,
				foursquare_type: undefined,
				reply_markup: {
					inline_keyboard: [],
				},
			});
			return {} as any;
		},
	};

	const sendMenu = generateSendMenuToChatFunction(
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

	await sendMenu(666, fakeContext as any);
});

await test('telegram-send invoice', async () => {
	const menu = new MenuTemplate<BaseContext>({
		invoice: {
			title: 'A',
			description: 'B',
			currency: 'EUR',
			payload: 'D',
			prices: [],
		},
	});

	const fakeTelegram: Partial<Api> = {
		async sendInvoice(
			chatId,
			title,
			description,
			payload,
			currency,
			prices,
			other,
		) {
			strictEqual(chatId, 666);
			strictEqual(title, 'A');
			strictEqual(description, 'B');
			strictEqual(currency, 'EUR');
			strictEqual(payload, 'D');
			deepStrictEqual(prices, []);
			deepStrictEqual(other, {
				reply_markup: {
					inline_keyboard: [],
				},
			});
			return {} as any;
		},
	};

	const sendMenu = generateSendMenuToChatFunction(
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

	await sendMenu(666, fakeContext as any);
});
