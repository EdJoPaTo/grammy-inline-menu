import {deepStrictEqual, rejects} from 'node:assert'
import {test} from 'node:test'
import {Keyboard} from './keyboard.js'

await test('keyboard no buttons', async () => {
	const k = new Keyboard<unknown>()
	const result = await k.render(undefined, '/')
	deepStrictEqual(result, [])
})

await test('keyboard pass through url button', async () => {
	const k = new Keyboard<unknown>()
	k.add(false, {text: 'foo', url: 'https://edjopato.de'})

	const result = await k.render(undefined, '/')
	deepStrictEqual(result, [[{
		text: 'foo',
		url: 'https://edjopato.de',
	}]])
})

await test('keyboard pass through url button creator', async () => {
	const k = new Keyboard<unknown>()
	k.add(false, () => ({text: 'foo', url: 'https://edjopato.de'}))

	const result = await k.render(undefined, '/')
	deepStrictEqual(result, [[{
		text: 'foo',
		url: 'https://edjopato.de',
	}]])
})

await test('keyboard callback button template', async () => {
	const k = new Keyboard<unknown>()
	k.add(false, {text: 'foo', relativePath: 'bar'})

	const result = await k.render(undefined, '/')
	deepStrictEqual(result, [[{
		text: 'foo',
		callback_data: '/bar',
	}]])
})

await test('keyboard callback button template below path', async () => {
	const k = new Keyboard<unknown>()
	k.add(false, {text: 'foo', relativePath: 'bar'})

	const result = await k.render(undefined, '/somewhere/in/menus/')
	deepStrictEqual(result, [[{
		text: 'foo',
		callback_data: '/somewhere/in/menus/bar',
	}]])
})

await test('keyboard two buttons', async () => {
	const k = new Keyboard<unknown>()
	k.add(false, {text: 'foo', url: 'https://edjopato.de'})
	k.add(false, {text: 'bar', url: 'https://edjopato.de'})

	const result = await k.render(undefined, '/')
	deepStrictEqual(result, [
		[
			{
				text: 'foo',
				url: 'https://edjopato.de',
			},
		],
		[
			{
				text: 'bar',
				url: 'https://edjopato.de',
			},
		],
	])
})

await test('keyboard two buttons same row', async () => {
	const k = new Keyboard<unknown>()
	k.add(false, {text: 'foo', url: 'https://edjopato.de'})
	k.add(true, {text: 'bar', url: 'https://edjopato.de'})

	const result = await k.render(undefined, '/')
	deepStrictEqual(result, [
		[
			{
				text: 'foo',
				url: 'https://edjopato.de',
			},
			{
				text: 'bar',
				url: 'https://edjopato.de',
			},
		],
	])
})

await test('keyboard creator creating nothing', async () => {
	const k = new Keyboard<unknown>()
	k.addCreator(() => [])

	const result = await k.render(undefined, '/')
	deepStrictEqual(result, [])
})

await test('keyboard creator creating url button', async () => {
	const k = new Keyboard<unknown>()
	k.addCreator(() => [[{
		text: 'foo',
		url: 'https://edjopato.de',
	}]])

	const result = await k.render(undefined, '/')
	deepStrictEqual(result, [[{
		text: 'foo',
		url: 'https://edjopato.de',
	}]])
})

await test('keyboard hints too long callback data', async () => {
	const ten = '0123456789'

	const k = new Keyboard<unknown>()
	k.add(false, {text: 'bla', relativePath: ten + ten + ten + ten + ten})

	// 5*ten + '/some/long/base/' is longer than 64 chars

	await rejects(async () => k.render(undefined, '/some/long/base/'), {
		message: /callback_data only supports 1-64 bytes/,
	})
})

await test('keyboard hints too long cyrillic callback data', async () => {
	// This is 48 characters but due to unicode its 2*48 -> more than 64
	const relativePath = 'очень длинный абсолютный путь больше 32 символов'

	const k = new Keyboard<unknown>()
	k.add(false, {text: 'bla', relativePath})

	await rejects(async () => k.render(undefined, '/base/'), {
		message: /callback_data only supports 1-64 bytes/,
	})
})
