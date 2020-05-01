import test from 'ava'

import {generateSelectButtons} from './select'

test('empty choices no buttons', async t => {
	const func = generateSelectButtons('pre', [], {
		isSet: () => false,
		set: () => {
			t.fail('no need to call set on keyboard creation')
		}
	})

	const buttons = await func(undefined)
	t.deepEqual(buttons, [])
})

test('is set creates false button', async t => {
	const func = generateSelectButtons('pre', ['a'], {
		prefixTrue: 'T',
		isSet: () => true,
		set: () => {
			t.fail('no need to call set on keyboard creation')
		}
	})

	const buttons = await func(undefined)
	t.deepEqual(buttons, [[{
		text: 'T a',
		relativePath: 'preF:a'
	}]])
})

test('is not set creates true button', async t => {
	const func = generateSelectButtons('pre', ['a'], {
		isSet: () => false,
		set: () => {
			t.fail('no need to call set on keyboard creation')
		}
	})

	const buttons = await func(undefined)
	t.deepEqual(buttons, [[{
		text: 'a',
		relativePath: 'preT:a'
	}]])
})

test('multiselect also prefixes currently false buttons', async t => {
	const func = generateSelectButtons('pre', ['a'], {
		multiselect: true,
		prefixFalse: 'F',
		isSet: () => false,
		set: () => {
			t.fail('no need to call set on keyboard creation')
		}
	})

	const buttons = await func(undefined)
	t.deepEqual(buttons, [[{
		text: 'F a',
		relativePath: 'preT:a'
	}]])
})

test('creates pagination buttons', async t => {
	const func = generateSelectButtons('pre', ['a', 'b', 'c'], {
		columns: 1,
		maxRows: 1,
		isSet: () => false,
		set: () => {
			t.fail('no need to call set on keyboard creation')
		},
		setPage: () => {
			t.fail('no need to call setPage on keyboard creation')
		}
	})
	const buttons = await func(undefined)
	t.deepEqual(buttons, [
		[{
			text: 'a',
			relativePath: 'preT:a'
		}],
		[{
			text: '1',
			relativePath: 'preP:1'
		}, {
			text: '▶️ 2',
			relativePath: 'preP:2'
		}, {
			text: '⏩ 3',
			relativePath: 'preP:3'
		}]
	])
})

test('show keys of page 2', async t => {
	const func = generateSelectButtons('pre', ['a', 'b', 'c'], {
		columns: 1,
		maxRows: 1,
		getCurrentPage: () => 2,
		isSet: () => false,
		set: () => {
			t.fail('no need to call set on keyboard creation')
		}
	})
	const buttons = await func(undefined)
	t.deepEqual(buttons, [[{
		text: 'b',
		relativePath: 'preT:b'
	}]])
})

test('choice function is run', async t => {
	t.plan(4)
	const choiceFunction = (context: string) => {
		t.pass()
		return [context]
	}

	const func = generateSelectButtons('pre', choiceFunction, {
		isSet: () => false,
		set: () => {
			t.fail('no need to call set on keyboard creation')
		}
	})

	t.deepEqual(await func('a'), [[{
		text: 'a',
		relativePath: 'preT:a'
	}]])
	t.deepEqual(await func('b'), [[{
		text: 'b',
		relativePath: 'preT:b'
	}]])
})

test('hidden does not render any buttons', async t => {
	const choiceFunction = () => {
		t.fail('hidden -> dont call choices')
		throw new Error('hidden -> dont call choices')
	}

	const func = generateSelectButtons('pre', choiceFunction, {
		hide: () => true,
		isSet: () => {
			t.fail('dont call as its hidden')
			throw new Error('dont call as its hidden')
		},
		set: () => {
			t.fail('no need to call set on keyboard creation')
		}
	})
	const buttons = await func(undefined)
	t.deepEqual(buttons, [])
})
