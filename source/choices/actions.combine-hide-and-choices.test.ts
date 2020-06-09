import test from 'ava'

import {combineHideAndChoices} from './actions'

test('choices are not called when hide is true', async t => {
	const func = combineHideAndChoices(() => {
		throw new Error('dont call choices when already hidden')
	}, () => true)

	const isHidden = await func(undefined, '/')
	t.is(isHidden, true)
})

test('does not hide when not a TelegrafContext', async t => {
	const func = combineHideAndChoices(['a'], undefined)

	const isHidden = await func(undefined, '/')
	t.is(isHidden, false)
})

test('does not hide when choice still available', async t => {
	const func = combineHideAndChoices(['a'], undefined)

	const data = '/foo/bar/a'
	const context = {
		match: /\/([^/]+)$/.exec(data),
		callbackQuery: {
			data
		}
	}
	const isHidden = await func(context, data)
	t.is(isHidden, false)
})

test('does not hide when choice still available from function', async t => {
	const func = combineHideAndChoices(() => ['a'], undefined)

	const data = '/foo/bar/a'
	const context = {
		match: /\/([^/]+)$/.exec(data),
		callbackQuery: {
			data
		}
	}
	const isHidden = await func(context, data)
	t.is(isHidden, false)
})

test('hides when choice isnt available anymore', async t => {
	const func = combineHideAndChoices(['a'], undefined)

	const data = '/foo/bar/wow'
	const context = {
		match: /\/([^/]+)$/.exec(data),
		callbackQuery: {
			data
		}
	}
	const isHidden = await func(context, data)
	t.is(isHidden, true)
})
