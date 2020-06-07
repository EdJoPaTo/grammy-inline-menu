import test from 'ava'

import {MenuTemplate} from '../../source/menu-template'

test('interact do', t => {
	const menu = new MenuTemplate('whatever')
	t.throws(() => {
		// @ts-expect-error
		menu.interact('Button', 'unique', {})
	}, {message: /You have to specify/})
})

test('choose do', t => {
	const menu = new MenuTemplate('whatever')
	t.throws(() => {
		// @ts-expect-error
		menu.choose('unique', [], {})
	}, {message: /You have to specify/})
})

test('select set', t => {
	const menu = new MenuTemplate('whatever')
	t.throws(() => {
		// @ts-expect-error
		menu.select('unique', [], {
			isSet: () => {
				t.fail('dont call this function')
				throw new Error('dont call this function')
			}
		})
	}, {message: /You have to specify/})
})

test('select isSet', t => {
	const menu = new MenuTemplate('whatever')
	t.throws(() => {
		// @ts-expect-error
		menu.select('unique', [], {
			set: () => {
				t.fail('dont call this function')
				throw new Error('dont call this function')
			}
		})
	}, {message: /You have to specify/})
})

test('toggle set', t => {
	const menu = new MenuTemplate('whatever')
	t.throws(() => {
		// @ts-expect-error
		menu.toggle('Button', 'unique', {
			isSet: () => {
				t.fail('dont call this function')
				throw new Error('dont call this function')
			}
		})
	}, {message: /You have to specify/})
})

test('toggle isSet', t => {
	const menu = new MenuTemplate('whatever')
	t.throws(() => {
		// @ts-expect-error
		menu.toggle('Button', 'unique', {
			set: () => {
				t.fail('dont call this function')
				throw new Error('dont call this function')
			}
		})
	}, {message: /You have to specify/})
})

test('pagination getCurrentPage', t => {
	const menu = new MenuTemplate('whatever')
	t.throws(() => {
		// @ts-expect-error
		menu.pagination('unique', {
			getTotalPages: () => {
				t.fail('dont call this function')
				throw new Error('dont call this function')
			},
			setPage: () => {
				t.fail('dont call this function')
				throw new Error('dont call this function')
			}
		})
	}, {message: /You have to specify/})
})

test('pagination getTotalPages', t => {
	const menu = new MenuTemplate('whatever')
	t.throws(() => {
		// @ts-expect-error
		menu.pagination('unique', {
			getCurrentPage: () => {
				t.fail('dont call this function')
				throw new Error('dont call this function')
			},
			setPage: () => {
				t.fail('dont call this function')
				throw new Error('dont call this function')
			}
		})
	}, {message: /You have to specify/})
})

test('pagination setPage', t => {
	const menu = new MenuTemplate('whatever')
	t.throws(() => {
		// @ts-expect-error
		menu.pagination('unique', {
			getCurrentPage: () => {
				t.fail('dont call this function')
				throw new Error('dont call this function')
			},
			getTotalPages: () => {
				t.fail('dont call this function')
				throw new Error('dont call this function')
			}
		})
	}, {message: /You have to specify/})
})
