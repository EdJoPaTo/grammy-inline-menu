import test from 'ava'
import {TelegrafContext} from 'telegraf/typings/context'

import {MenuTemplate} from '../../source'

// This test file also tests replyMenuToContext indirectly as its the edit fallback
import {editMenuOnContext} from '../../source/send-menu'

test('text reply when not a callback query', async t => {
	t.plan(2)
	const menu = new MenuTemplate<TelegrafContext>('whatever')

	const fakeContext: Partial<TelegrafContext> = {
		callbackQuery: undefined,
		reply: async (text, extra) => {
			t.is(text, 'whatever')
			t.deepEqual(extra, {
				disable_web_page_preview: false,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: []
				}
			})
			return Promise.resolve(undefined as any)
		}
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('text reply when no message on callback query', async t => {
	t.plan(3)
	const menu = new MenuTemplate<TelegrafContext>('whatever')

	const fakeContext: Partial<TelegrafContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666'
		},
		answerCbQuery: async text => {
			t.is(text, undefined)
			return Promise.resolve(true)
		},
		reply: async (text, extra) => {
			t.is(text, 'whatever')
			t.deepEqual(extra, {
				disable_web_page_preview: false,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: []
				}
			})
			return Promise.resolve(undefined as any)
		}
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('text edit when message is a text message', async t => {
	t.plan(3)
	const menu = new MenuTemplate<TelegrafContext>('whatever')

	const fakeContext: Partial<TelegrafContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'Hi Bob'
			}
		},
		answerCbQuery: async text => {
			t.is(text, undefined)
			return Promise.resolve(true)
		},
		editMessageText: async (text, extra) => {
			t.is(text, 'whatever')
			t.deepEqual(extra, {
				disable_web_page_preview: false,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: []
				}
			})
			return Promise.resolve(undefined as any)
		}
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('text reply when message is a media message', async t => {
	t.plan(4)
	const menu = new MenuTemplate<TelegrafContext>('whatever')

	const fakeContext: Partial<TelegrafContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				photo: []
			}
		},
		answerCbQuery: async text => {
			t.is(text, undefined)
			return Promise.resolve(true)
		},
		deleteMessage: async messageId => {
			t.is(messageId, undefined)
			return Promise.resolve(true)
		},
		reply: async (text, extra) => {
			t.is(text, 'whatever')
			t.deepEqual(extra, {
				disable_web_page_preview: false,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: []
				}
			})
			return Promise.resolve(undefined as any)
		}
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('text reply when message is a media message but fails with delete', async t => {
	t.plan(3)
	const menu = new MenuTemplate<TelegrafContext>('whatever')

	const fakeContext: Partial<TelegrafContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				photo: []
			}
		},
		answerCbQuery: async text => {
			t.is(text, undefined)
			return Promise.resolve(true)
		},
		deleteMessage: async () => {
			throw new Error('whatever went wrong')
		},
		editMessageReplyMarkup: async markup => {
			t.is(markup, undefined)
			return Promise.resolve(true)
		},
		reply: async () => {
			t.pass()
			return Promise.resolve(undefined as any)
		}
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('media reply when not a callback query', async t => {
	t.plan(2)
	const menu = new MenuTemplate<TelegrafContext>({media: 'whatever', type: 'photo'})

	const fakeContext: Partial<TelegrafContext> = {
		callbackQuery: undefined,
		replyWithPhoto: async (photo, extra) => {
			t.is(photo, 'whatever')
			t.deepEqual(extra, {
				caption: undefined,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: []
				}
			})
			return Promise.resolve(undefined as any)
		}
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('media reply when text message', async t => {
	t.plan(4)
	const menu = new MenuTemplate<TelegrafContext>({media: 'whatever', type: 'photo'})

	const fakeContext: Partial<TelegrafContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'whatever'
			}
		},
		answerCbQuery: async text => {
			t.is(text, undefined)
			return Promise.resolve(true)
		},
		deleteMessage: async messageId => {
			t.is(messageId, undefined)
			return Promise.resolve(true)
		},
		replyWithPhoto: async (photo, extra) => {
			t.is(photo, 'whatever')
			t.deepEqual(extra, {
				caption: undefined,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: []
				}
			})
			return Promise.resolve(undefined as any)
		}
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('media edit when media message', async t => {
	t.plan(3)
	const menu = new MenuTemplate<TelegrafContext>({media: 'whatever', type: 'photo'})

	const fakeContext: Partial<TelegrafContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				photo: []
			}
		},
		answerCbQuery: async text => {
			t.is(text, undefined)
			return Promise.resolve(true)
		},
		deleteMessage: async messageId => {
			t.is(messageId, undefined)
			return Promise.resolve(true)
		},
		editMessageMedia: async (media, extra) => {
			t.deepEqual(media, {
				media: 'whatever',
				type: 'photo',
				caption: undefined,
				parse_mode: undefined
			})
			t.deepEqual(extra, {
				caption: undefined,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: []
				}
			} as any)
			return Promise.resolve(undefined as any)
		}
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('does not throw message is not modified', async t => {
	t.plan(2)
	const menu = new MenuTemplate<TelegrafContext>('whatever')

	const fakeContext: Partial<TelegrafContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'Hi Bob'
			}
		},
		answerCbQuery: async () => Promise.resolve(true),
		editMessageText: async () => {
			t.pass()
			throw new Error('lalala message is not modified lalala')
		}
	}

	await t.notThrowsAsync(async () => editMenuOnContext(menu, fakeContext as any, '/'))
})

test('does throw unrecoverable edit errors', async t => {
	t.plan(2)
	const menu = new MenuTemplate<TelegrafContext>('whatever')

	const fakeContext: Partial<TelegrafContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'Hi Bob'
			}
		},
		answerCbQuery: async () => Promise.resolve(true),
		editMessageText: async () => {
			t.pass()
			throw new Error('something went wrong for testing')
		}
	}

	await t.throwsAsync(
		async () => editMenuOnContext(menu, fakeContext as any, '/'),
		{message: 'something went wrong for testing'}
	)
})

test('text edit without webpage preview', async t => {
	const menu = new MenuTemplate<TelegrafContext>({text: 'whatever', disable_web_page_preview: true})

	const fakeContext: Partial<TelegrafContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'Hi Bob'
			}
		},
		answerCbQuery: async () => Promise.resolve(true),
		editMessageText: async (_text, extra) => {
			t.deepEqual(extra, {
				disable_web_page_preview: true,
				parse_mode: undefined,
				reply_markup: {
					inline_keyboard: []
				}
			})
			return Promise.resolve(undefined as any)
		}
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('text edit with parse mode', async t => {
	const menu = new MenuTemplate<TelegrafContext>({text: 'whatever', parse_mode: 'Markdown'})

	const fakeContext: Partial<TelegrafContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'Hi Bob'
			}
		},
		answerCbQuery: async () => Promise.resolve(true),
		editMessageText: async (_text, extra) => {
			t.deepEqual(extra, {
				disable_web_page_preview: undefined,
				parse_mode: 'Markdown',
				reply_markup: {
					inline_keyboard: []
				}
			})
			return Promise.resolve(undefined as any)
		}
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('text edit with button', async t => {
	const menu = new MenuTemplate<TelegrafContext>('whatever')
	menu.manual({text: 'Button', callback_data: '/'})

	const fakeContext: Partial<TelegrafContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				text: 'Hi Bob'
			}
		},
		answerCbQuery: async () => Promise.resolve(true),
		editMessageText: async (_text, extra) => {
			t.deepEqual(extra?.reply_markup, {
				inline_keyboard: [[{
					text: 'Button',
					callback_data: '/'
				}]]
			})
			return Promise.resolve(undefined as any)
		}
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})

test('media edit with button', async t => {
	const menu = new MenuTemplate<TelegrafContext>({media: 'whatever', type: 'photo'})
	menu.manual({text: 'Button', callback_data: '/'})

	const fakeContext: Partial<TelegrafContext> = {
		callbackQuery: {
			id: '666',
			from: undefined as any,
			chat_instance: '666',
			message: {
				message_id: 666,
				date: 666,
				chat: undefined as any,
				photo: []
			}
		},
		answerCbQuery: async () => Promise.resolve(true),
		editMessageMedia: async (_media, extra) => {
			t.deepEqual(extra?.reply_markup, {
				inline_keyboard: [[{
					text: 'Button',
					callback_data: '/'
				}]]
			})
			return Promise.resolve(undefined as any)
		}
	}

	await editMenuOnContext(menu, fakeContext as any, '/')
})
