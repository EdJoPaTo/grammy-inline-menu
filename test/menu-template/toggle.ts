import {deepStrictEqual, strictEqual} from 'node:assert';
import {test} from 'node:test';
import {MenuTemplate} from '../../source/menu-template.js';

await test('menu-template toggle button hidden', async () => {
	const menu = new MenuTemplate('whatever');
	menu.toggle('unique', {
		text: 'Button',
		hide: () => true,
		isSet() {
			throw new Error('do not call this function when hidden');
		},
		set() {
			throw new Error('do not call this function');
		},
	});
	const keyboard = await menu.renderKeyboard(undefined, '/');
	deepStrictEqual(keyboard, []);
});

await test('menu-template toggle button true', async () => {
	const menu = new MenuTemplate<string>('whatever');
	menu.toggle('unique', {
		text: 'Button',
		isSet(context, path) {
			strictEqual(context, 'foo');
			strictEqual(path, '/');
			return true;
		},
		set() {
			throw new Error('do not call this function');
		},
	});
	const keyboard = await menu.renderKeyboard('foo', '/');
	deepStrictEqual(keyboard, [[{
		text: '✅ Button',
		callback_data: '/unique:false',
	}]]);
});

await test('menu-template toggle button false', async () => {
	const menu = new MenuTemplate<string>('whatever');
	menu.toggle('unique', {
		text: 'Button',
		isSet(context, path) {
			strictEqual(context, 'foo');
			strictEqual(path, '/');
			return false;
		},
		set() {
			throw new Error('do not call this function');
		},
	});
	const keyboard = await menu.renderKeyboard('foo', '/');
	deepStrictEqual(keyboard, [[{
		text: '🚫 Button',
		callback_data: '/unique:true',
	}]]);
});

await test('menu-template toggle action triggers', () => {
	const menu = new MenuTemplate<string>('whatever');
	menu.toggle('unique', {
		text: 'Button',
		hide: () => true,
		isSet() {
			throw new Error('do not call this function');
		},
		set() {
			throw new Error('do not call this function');
		},
	});

	const actions = [...menu.renderActionHandlers(/^\//)];
	strictEqual(actions.length, 2);

	const triggers = new Set(actions.map(o => o.trigger.source));
	strictEqual(triggers.has('^\\/unique:true$'), true);
	strictEqual(triggers.has('^\\/unique:false$'), true);
});

await test('menu-template toggle action hidden', async () => {
	const menu = new MenuTemplate<string>('whatever');
	menu.toggle('unique', {
		text: 'Button',
		hide: () => true,
		isSet() {
			throw new Error('do not call this function');
		},
		set() {
			throw new Error('do not call this function');
		},
	});

	const actions = [...menu.renderActionHandlers(/^\//)];

	const result0 = await actions[0]?.doFunction('foo', '/unique:true');
	strictEqual(result0, '.');

	const result1 = await actions[1]?.doFunction('foo', '/unique:true');
	strictEqual(result1, '.');
});

await test('menu-template toggle action true', async () => {
	const menu = new MenuTemplate<string>('whatever');
	menu.toggle('unique', {
		text: 'Button',
		isSet() {
			throw new Error('do not call this function');
		},
		set(context, newState, path) {
			strictEqual(context, 'foo');
			strictEqual(newState, true);
			strictEqual(path, '/unique:true');
			return 'wow';
		},
	});

	const actions = [...menu.renderActionHandlers(/^\//)];
	const action = actions.find(o => o.trigger.source.includes('true'))!;
	const result = await action.doFunction('foo', '/unique:true');
	strictEqual(result, 'wow');
});

await test('menu-template toggle action false', async () => {
	const menu = new MenuTemplate<string>('whatever');
	menu.toggle('unique', {
		text: 'Button',
		isSet() {
			throw new Error('do not call this function');
		},
		set(context, newState, path) {
			strictEqual(context, 'foo');
			strictEqual(newState, false);
			strictEqual(path, '/unique:false');
			return 'wow';
		},
	});

	const actions = [...menu.renderActionHandlers(/^\//)];
	const action = actions.find(o => o.trigger.source.includes('false'))!;
	const result = await action.doFunction('foo', '/unique:false');
	strictEqual(result, 'wow');
});
