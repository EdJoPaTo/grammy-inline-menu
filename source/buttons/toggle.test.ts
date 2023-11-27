import {deepStrictEqual, strictEqual} from 'node:assert'
import {test} from 'node:test'
import {generateToggleButton} from './toggle.js'

await test('toggle hidden does not render any button', async () => {
	const func = generateToggleButton('text', 'pre', {
		hide: () => true,
		isSet() {
			throw new Error('do not call as its hidden')
		},
		set() {
			throw new Error('do not call as its hidden')
		},
	})

	const button = await func(undefined, 'wow/')
	strictEqual(button, undefined)
})

await test('toggle is true button', async () => {
	const func = generateToggleButton('text', 'pre', {
		isSet: () => true,
		set() {
			throw new Error('do not call as the button is not hit')
		},
	})

	const button = await func(undefined, 'wow/')
	deepStrictEqual(button, {
		text: '✅ text',
		relativePath: 'pre:false',
	})
})

await test('toggle is false button', async () => {
	const func = generateToggleButton('text', 'pre', {
		isSet: () => false,
		set() {
			throw new Error('do not call as the button is not hit')
		},
	})

	const button = await func(undefined, 'wow/')
	deepStrictEqual(button, {
		text: '🚫 text',
		relativePath: 'pre:true',
	})
})

await test('toggle own format', async () => {
	const func = generateToggleButton('text', 'pre', {
		isSet: () => true,
		set() {
			throw new Error('do not call as the button is not hit')
		},
		formatState(_context, text, state) {
			strictEqual(text, 'text')
			strictEqual(state, true)
			return 'lalala'
		},
	})

	const button = await func(undefined, 'wow/')
	deepStrictEqual(button, {
		text: 'lalala',
		relativePath: 'pre:false',
	})
})

await test('toggle async text', async () => {
	const func = generateToggleButton(() => 'text', 'pre', {
		isSet: () => true,
		set() {
			throw new Error('do not call as the button is not hit')
		},
	})

	const button = await func(undefined, 'wow/')
	deepStrictEqual(button, {
		text: '✅ text',
		relativePath: 'pre:false',
	})
})
