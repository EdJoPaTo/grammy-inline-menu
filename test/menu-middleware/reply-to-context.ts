import {deepStrictEqual, rejects, strictEqual} from 'node:assert';
import {test} from 'node:test';
import type {Context as BaseContext} from 'grammy';
import type {MenuLike, Submenu} from '../../source/menu-like.js';
import {MenuMiddleware} from '../../source/menu-middleware.js';

await test('menu-middleware reply-to-context replies main menu', async t => {
	const submenuMenu: MenuLike<unknown> = {
		listSubmenus: () => new Set(),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'submenu',
		renderKeyboard: () => [],
	};
	const submenu: Submenu<unknown> = {
		trigger: /submenu\//,
		hide: () => false,
		menu: submenuMenu,
	};
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set([submenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	};

	const mm = new MenuMiddleware('/', menu);

	const reply = t.mock.fn<BaseContext['reply']>(async (text, other) => {
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
	});
	const fakeContext: Partial<BaseContext> = {reply};

	await mm.replyToContext(fakeContext as any);
	strictEqual(reply.mock.callCount(), 1);
});

await test('menu-middleware reply-to-context replies main menu explicitly', async t => {
	const submenuMenu: MenuLike<unknown> = {
		listSubmenus: () => new Set(),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'submenu',
		renderKeyboard: () => [],
	};
	const submenu: Submenu<unknown> = {
		trigger: /submenu\//,
		hide: () => false,
		menu: submenuMenu,
	};
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set([submenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	};

	const mm = new MenuMiddleware('/', menu);

	const reply = t.mock.fn<BaseContext['reply']>(async (text, other) => {
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
	});
	const fakeContext: Partial<BaseContext> = {reply};

	await mm.replyToContext(fakeContext as any, '/');
	strictEqual(reply.mock.callCount(), 1);
});

await test('menu-middleware reply-to-context replies submenu', async t => {
	const submenuMenu: MenuLike<unknown> = {
		listSubmenus: () => new Set(),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'submenu',
		renderKeyboard: () => [],
	};
	const submenu: Submenu<unknown> = {
		trigger: /submenu\//,
		hide: () => false,
		menu: submenuMenu,
	};
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set([submenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	};

	const mm = new MenuMiddleware('/', menu);

	const reply = t.mock.fn<BaseContext['reply']>(async (text, other) => {
		strictEqual(text, 'submenu');
		deepStrictEqual(other, {
			disable_web_page_preview: false,
			entities: undefined,
			parse_mode: undefined,
			reply_markup: {
				inline_keyboard: [],
			},
		});
		return {} as any;
	});
	const fakeContext: Partial<BaseContext> = {reply};

	await mm.replyToContext(fakeContext as any, '/submenu/');
	strictEqual(reply.mock.callCount(), 1);
});

await test('menu-middleware reply-to-context fails with out of scope path', async () => {
	const submenuMenu: MenuLike<unknown> = {
		listSubmenus: () => new Set(),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'submenu',
		renderKeyboard: () => [],
	};
	const submenu: Submenu<unknown> = {
		trigger: /submenu\//,
		hide: () => false,
		menu: submenuMenu,
	};
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set([submenu]),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	};

	const mm = new MenuMiddleware('/', menu);

	await rejects(async () => mm.replyToContext({} as any, 'foo/'), {
		message: 'There is no menu which works with your supplied path: foo/',
	});
});

await test('menu-middleware reply-to-context fails when rootTrigger is a regex and path is not explicit', async () => {
	const menu: MenuLike<unknown> = {
		listSubmenus: () => new Set(),
		renderActionHandlers: () => new Set(),
		renderBody: () => 'whatever',
		renderKeyboard: () => [],
	};

	const mm = new MenuMiddleware(/^tree(\d+)\//, menu);

	await rejects(
		async () => {
			await mm.replyToContext({} as any);
		},
		{message: /absolute path explicitly as a string/},
	);
});
