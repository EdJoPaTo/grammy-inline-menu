import {deepStrictEqual, strictEqual} from 'node:assert'
import {test} from 'node:test'
import {generateSelectButtons} from './select.js'

await test('generateSelectButtons empty choices no buttons', async () => {
	const func = generateSelectButtons('pre', [], {
		isSet: () => false,
		set() {
			throw new Error('no need to call set on keyboard creation')
		},
	})
	const buttons = await func(undefined, '/')
	deepStrictEqual(buttons, [])
})

await test('generateSelectButtons is set creates false button', async () => {
	const func = generateSelectButtons('pre', ['a'], {
		isSet: () => true,
		set() {
			throw new Error('no need to call set on keyboard creation')
		},
	})
	const buttons = await func(undefined, '/')
	deepStrictEqual(buttons, [[{
		text: '✅ a',
		relativePath: 'preF:a',
	}]])
})

await test('generateSelectButtons is not set creates true button', async () => {
	const func = generateSelectButtons('pre', ['a'], {
		isSet: () => false,
		set() {
			throw new Error('no need to call set on keyboard creation')
		},
	})
	const buttons = await func(undefined, '/')
	deepStrictEqual(buttons, [[{
		text: 'a',
		relativePath: 'preT:a',
	}]])
})

await test('generateSelectButtons showFalseEmoji also prefixes currently false buttons', async () => {
	const func = generateSelectButtons('pre', ['a'], {
		showFalseEmoji: true,
		isSet: () => false,
		set() {
			throw new Error('no need to call set on keyboard creation')
		},
	})
	const buttons = await func(undefined, '/')
	deepStrictEqual(buttons, [[{
		text: '🚫 a',
		relativePath: 'preT:a',
	}]])
})

await test('generateSelectButtons creates pagination buttons', async () => {
	const func = generateSelectButtons('pre', ['a', 'b', 'c'], {
		columns: 1,
		maxRows: 1,
		isSet: () => false,
		set() {
			throw new Error('no need to call set on keyboard creation')
		},
		setPage() {
			throw new Error('no need to call setPage on keyboard creation')
		},
	})
	const buttons = await func(undefined, '/')
	deepStrictEqual(buttons, [
		[{
			text: 'a',
			relativePath: 'preT:a',
		}],
		[{
			text: '1',
			relativePath: 'preP:1',
		}, {
			text: '▶️ 2',
			relativePath: 'preP:2',
		}, {
			text: '⏩ 3',
			relativePath: 'preP:3',
		}],
	])
})

await test('generateSelectButtons show keys of page 2', async () => {
	const func = generateSelectButtons('pre', ['a', 'b', 'c'], {
		columns: 1,
		maxRows: 1,
		getCurrentPage: () => 2,
		isSet: () => false,
		set() {
			throw new Error('no need to call set on keyboard creation')
		},
	})
	const buttons = await func(undefined, '/')
	deepStrictEqual(buttons, [[{
		text: 'b',
		relativePath: 'preT:b',
	}]])
})

await test('generateSelectButtons choice function is run', async t => {
	const choiceFunction = t.mock.fn((context: string) => [context])
	const func = generateSelectButtons('pre', choiceFunction, {
		isSet: () => false,
		set() {
			throw new Error('no need to call set on keyboard creation')
		},
	})
	deepStrictEqual(await func('a', '/'), [[{
		text: 'a',
		relativePath: 'preT:a',
	}]])
	deepStrictEqual(await func('b', '/'), [[{
		text: 'b',
		relativePath: 'preT:b',
	}]])
	strictEqual(choiceFunction.mock.callCount(), 2)
})

await test('generateSelectButtons hidden does not render any buttons', async () => {
	const choiceFunction = (): never => {
		throw new Error('hidden -> dont call choices')
	}

	const func = generateSelectButtons('pre', choiceFunction, {
		hide: () => true,
		isSet() {
			throw new Error('dont call as its hidden')
		},
		set() {
			throw new Error('no need to call set on keyboard creation')
		},
	})
	const buttons = await func(undefined, '/')
	deepStrictEqual(buttons, [])
})

await test('generateSelectButtons format state', async () => {
	const func = generateSelectButtons('pre', ['a'], {
		isSet: () => true,
		set() {
			throw new Error('no need to call set on keyboard creation')
		},
		formatState(_context, textResult, state, key) {
			strictEqual(textResult, 'a')
			strictEqual(state, true)
			strictEqual(key, 'a')
			return 'lalala'
		},
	})

	const buttons = await func(undefined, '/')
	deepStrictEqual(buttons, [[{
		text: 'lalala',
		relativePath: 'preF:a',
	}]])
})
