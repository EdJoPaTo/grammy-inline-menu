import {throws} from 'node:assert';
import {test} from 'node:test';
import {MenuTemplate} from '../../source/menu-template.js';

await test('menu-template javascript-forgot interact do', () => {
	const menu = new MenuTemplate('whatever');
	throws(() => {
		// @ts-expect-error
		menu.interact('Button', 'unique', {});
	}, {message: /You have to specify/});
});

await test('menu-template javascript-forgot choose do', () => {
	const menu = new MenuTemplate('whatever');
	throws(() => {
		// @ts-expect-error
		menu.choose('unique', [], {});
	}, {message: /You have to specify/});
});

await test('menu-template javascript-forgot select set', () => {
	const menu = new MenuTemplate('whatever');
	throws(() => {
		// @ts-expect-error
		menu.select('unique', [], {
			isSet() {
				throw new Error('dont call this function');
			},
		});
	}, {message: /You have to specify/});
});

await test('menu-template javascript-forgot select isSet', () => {
	const menu = new MenuTemplate('whatever');
	throws(() => {
		// @ts-expect-error
		menu.select('unique', [], {
			set() {
				throw new Error('dont call this function');
			},
		});
	}, {message: /You have to specify/});
});

await test('menu-template javascript-forgot toggle set', () => {
	const menu = new MenuTemplate('whatever');
	throws(() => {
		// @ts-expect-error
		menu.toggle('Button', 'unique', {
			isSet() {
				throw new Error('dont call this function');
			},
		});
	}, {message: /You have to specify/});
});

await test('menu-template javascript-forgot toggle isSet', () => {
	const menu = new MenuTemplate('whatever');
	throws(() => {
		// @ts-expect-error
		menu.toggle('Button', 'unique', {
			set() {
				throw new Error('dont call this function');
			},
		});
	}, {message: /You have to specify/});
});

await test('menu-template javascript-forgot pagination getCurrentPage', () => {
	const menu = new MenuTemplate('whatever');
	throws(() => {
		// @ts-expect-error
		menu.pagination('unique', {
			getTotalPages() {
				throw new Error('dont call this function');
			},
			setPage() {
				throw new Error('dont call this function');
			},
		});
	}, {message: /You have to specify/});
});

await test('menu-template javascript-forgot pagination getTotalPages', () => {
	const menu = new MenuTemplate('whatever');
	throws(() => {
		// @ts-expect-error
		menu.pagination('unique', {
			getCurrentPage() {
				throw new Error('dont call this function');
			},
			setPage() {
				throw new Error('dont call this function');
			},
		});
	}, {message: /You have to specify/});
});

await test('menu-template javascript-forgot pagination setPage', () => {
	const menu = new MenuTemplate('whatever');
	throws(() => {
		// @ts-expect-error
		menu.pagination('unique', {
			getCurrentPage() {
				throw new Error('dont call this function');
			},
			getTotalPages() {
				throw new Error('dont call this function');
			},
		});
	}, {message: /You have to specify/});
});
