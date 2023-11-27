import {rejects, strictEqual} from 'node:assert'
import {test} from 'node:test'
import {combineHideAndChoices} from './actions.js'

await test('choice actions choices are not called when hide is true', async () => {
	const func = combineHideAndChoices('bla', () => {
		throw new Error('dont call choices when already hidden')
	}, () => true)
	const isHidden = await func(undefined, '/')
	strictEqual(isHidden, true)
})

await test('choice actions does not hide when choice still available', async () => {
	const func = combineHideAndChoices('bla', ['a'], undefined)
	const path = '/foo/bar/bla:a'
	const isHidden = await func(undefined, path)
	strictEqual(isHidden, false)
})

await test('choice actions does not hide when choice still available from function', async () => {
	const func = combineHideAndChoices('bla', () => ['a'], undefined)
	const path = '/foo/bar/bla:a'
	const isHidden = await func(undefined, path)
	strictEqual(isHidden, false)
})

await test('choice actions hides when choice isnt available anymore', async () => {
	const func = combineHideAndChoices('bla', ['a'], undefined)
	const path = '/foo/bar/bla:wow'
	const isHidden = await func(undefined, path)
	strictEqual(isHidden, true)
})

await test('choice actions does not hide submenu when choice still available from function', async () => {
	const func = combineHideAndChoices('bla', () => ['a'], undefined)
	const path = '/foo/bar/bla:a/'
	const isHidden = await func(undefined, path)
	strictEqual(isHidden, false)
})

await test('choice actions unrelated path throws', async () => {
	const func = combineHideAndChoices('bla', () => ['a'], undefined)
	await rejects(async () => func(undefined, 'hi there'), {
		message: 'could not read choice from path',
	})
})
