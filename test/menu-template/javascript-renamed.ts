import test from 'ava'

import {MenuTemplate} from '../../source/menu-template'

test('interaction doFunc', t => {
	const menu = new MenuTemplate('whatever')
	t.throws(() => {
		menu.interact('Button', 'unique', {
			// @ts-expect-error
			doFunc: () => {
				t.fail('dont call this function')
			}
		})
	}, {
		message: /renamed to do/
	})
})

test('select set', t => {
	const menu = new MenuTemplate('whatever')
	t.throws(() => {
		menu.select('unique', [], {
			// @ts-expect-error
			setFunc: () => {
				t.fail('dont call this function')
			}
		})
	}, {message: /renamed to/})
})

test('choose do', t => {
	const menu = new MenuTemplate('whatever')
	t.throws(() => {
		menu.choose('unique', [], {
			// @ts-expect-error
			doFunc: () => {
				t.fail('dont call this function')
			}
		})
	}, {message: /renamed to/})
})

test('select isSet', t => {
	const menu = new MenuTemplate('whatever')
	t.throws(() => {
		menu.select('unique', [], {
			// @ts-expect-error
			isSetFunc: () => {
				t.fail('dont call this function')
			}
		})
	}, {message: /renamed to/})
})

test('toggle set', t => {
	const menu = new MenuTemplate('whatever')
	t.throws(() => {
		menu.toggle('Button', 'unique', {
			// @ts-expect-error
			setFunc: () => {
				t.fail('dont call this function')
			}
		})
	}, {message: /renamed to/})
})

test('toggle isSet', t => {
	const menu = new MenuTemplate('whatever')
	t.throws(() => {
		menu.toggle('Button', 'unique', {
			// @ts-expect-error
			isSetFunc: () => {
				t.fail('dont call this function')
			}
		})
	}, {message: /renamed to/})
})
