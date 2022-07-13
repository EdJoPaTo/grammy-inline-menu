import test from 'ava'

import {Keyboard} from './keyboard.js'

test('no buttons', async t => {
	const k = new Keyboard<unknown>()

	const result = await k.render(undefined, '/')

	t.deepEqual(result, [])
})

test('pass through url button', async t => {
	const k = new Keyboard<unknown>()
	k.add(false, {text: 'foo', url: 'https://edjopato.de'})

	const result = await k.render(undefined, '/')

	t.deepEqual(result, [[{
		text: 'foo',
		url: 'https://edjopato.de',
	}]])
})

test('pass through url button creator', async t => {
	const k = new Keyboard<unknown>()
	k.add(false, () => ({text: 'foo', url: 'https://edjopato.de'}))

	const result = await k.render(undefined, '/')

	t.deepEqual(result, [[{
		text: 'foo',
		url: 'https://edjopato.de',
	}]])
})

test('callback button template', async t => {
	const k = new Keyboard<unknown>()
	k.add(false, {text: 'foo', relativePath: 'bar'})

	const result = await k.render(undefined, '/')

	t.deepEqual(result, [[{
		text: 'foo',
		callback_data: '/bar',
	}]])
})

test('callback button template below path', async t => {
	const k = new Keyboard<unknown>()
	k.add(false, {text: 'foo', relativePath: 'bar'})

	const result = await k.render(undefined, '/somewhere/in/menus/')

	t.deepEqual(result, [[{
		text: 'foo',
		callback_data: '/somewhere/in/menus/bar',
	}]])
})

test('two buttons', async t => {
	const k = new Keyboard<unknown>()
	k.add(false, {text: 'foo', url: 'https://edjopato.de'})
	k.add(false, {text: 'bar', url: 'https://edjopato.de'})

	const result = await k.render(undefined, '/')

	t.deepEqual(result, [
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

test('two buttons same row', async t => {
	const k = new Keyboard<unknown>()
	k.add(false, {text: 'foo', url: 'https://edjopato.de'})
	k.add(true, {text: 'bar', url: 'https://edjopato.de'})

	const result = await k.render(undefined, '/')

	t.deepEqual(result, [
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

test('creator creating nothing', async t => {
	const k = new Keyboard<unknown>()
	k.addCreator(() => [])

	const result = await k.render(undefined, '/')

	t.deepEqual(result, [])
})

test('creator creating url button', async t => {
	const k = new Keyboard<unknown>()
	k.addCreator(() => [[{
		text: 'foo',
		url: 'https://edjopato.de',
	}]])

	const result = await k.render(undefined, '/')

	t.deepEqual(result, [[{
		text: 'foo',
		url: 'https://edjopato.de',
	}]])
})

test('hints too long callback data', async t => {
	const ten = '0123456789'

	const k = new Keyboard<unknown>()
	k.add(false, {text: 'bla', relativePath: ten + ten + ten + ten + ten})

	await t.throwsAsync(
		// This would render to /some/long/base/ + 5*ten which is longer than 64 chars
		async () => k.render(undefined, '/some/long/base/'),
		{message: /callback_data only supports 1-64 bytes/},
	)
})

test('hints too long cyrillic callback data', async t => {
	// This is 48 characters but due to unicode its 2*48 -> more than 64
	const relativePath = 'очень длинный абсолютный путь больше 32 символов'

	const k = new Keyboard<unknown>()
	k.add(false, {text: 'bla', relativePath})

	await t.throwsAsync(
		async () => k.render(undefined, '/base/'),
		{message: /callback_data only supports 1-64 bytes/},
	)
})
