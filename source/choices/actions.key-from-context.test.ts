import test from 'ava'

import {getKeyFromContext} from './actions'

test('no context no key', t => {
	const key = getKeyFromContext(undefined)
	t.is(key, undefined)
})

test('context from hears is not used', t => {
	const text = 'wow'
	const key = getKeyFromContext({
		match: /(w)/.exec(text),
		message: {
			text
		}
	})
	t.is(key, undefined)
})

test('context from callbackQuery is used', t => {
	const data = '/foo/bar/wow'
	const key = getKeyFromContext({
		match: /\/([^/]+)$/.exec(data),
		callbackQuery: {
			data
		}
	})
	t.is(key, 'wow')
})
