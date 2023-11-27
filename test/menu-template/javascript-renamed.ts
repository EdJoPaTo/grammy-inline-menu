import {throws} from 'node:assert';
import {test} from 'node:test';
import {MenuTemplate} from '../../source/menu-template.js';

await test('menu-template javascript-renamed interaction doFunc', () => {
	const menu = new MenuTemplate('whatever');
	throws(() => {
		menu.interact('Button', 'unique', {
			// @ts-expect-error
			doFunc() {
				throw new Error('dont call this function');
			},
		});
	}, {
		message: /renamed to do/,
	});
});

await test('menu-template javascript-renamed select set', () => {
	const menu = new MenuTemplate('whatever');
	throws(() => {
		menu.select('unique', [], {
			// @ts-expect-error
			setFunc() {
				throw new Error('dont call this function');
			},
		});
	}, {message: /renamed to/});
});

await test('menu-template javascript-renamed choose do', () => {
	const menu = new MenuTemplate('whatever');
	throws(() => {
		menu.choose('unique', [], {
			// @ts-expect-error
			doFunc() {
				throw new Error('dont call this function');
			},
		});
	}, {message: /renamed to/});
});

await test('menu-template javascript-renamed selecthisSet', () => {
	const menu = new MenuTemplate('whatever');
	throws(() => {
		menu.select('unique', [], {
			// @ts-expect-error
			isSetFunc() {
				throw new Error('dont call this function');
			},
		});
	}, {message: /renamed to/});
});

await test('menu-template javascript-renamed toggle set', () => {
	const menu = new MenuTemplate('whatever');
	throws(() => {
		menu.toggle('Button', 'unique', {
			// @ts-expect-error
			setFunc() {
				throw new Error('dont call this function');
			},
		});
	}, {message: /renamed to/});
});

await test('menu-template javascript-renamed toggle isSet', () => {
	const menu = new MenuTemplate('whatever');
	throws(() => {
		menu.toggle('Button', 'unique', {
			// @ts-expect-error
			isSetFunc() {
				throw new Error('dont call this function');
			},
		});
	}, {message: /renamed to/});
});
