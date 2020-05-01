import test from 'ava'

import {
	prefixEmoji,
	emojiFalse,
	emojiTrue
} from './prefix'

test('no prefix', async t => {
	const result = await prefixEmoji('42', undefined)
	t.is(result, '42')
})

test('value text & prefix truthy still passthrough', async t => {
	const result = await prefixEmoji('42', '6')
	t.is(result, '6 42')
})

test('value text & prefix true', async t => {
	const result = await prefixEmoji('42', true)
	t.is(result, emojiTrue + ' 42')
})

test('value text & prefix false', async t => {
	const result = await prefixEmoji('42', false)
	t.is(result, emojiFalse + ' 42')
})

test('value text & prefix true hidden', async t => {
	const result = await prefixEmoji('42', true, {hideTrueEmoji: true})
	t.is(result, '42')
})

test('value text & prefix false hidden', async t => {
	const result = await prefixEmoji('42', false, {hideFalseEmoji: true})
	t.is(result, '42')
})

test('async prefix', async t => {
	const prefix = async (): Promise<boolean> => true
	const result = await prefixEmoji('42', prefix)
	t.is(result, emojiTrue + ' 42')
})

test('async text and prefix', async t => {
	const text = async (): Promise<string> => '42'
	const prefix = async (): Promise<boolean> => true
	const result = await prefixEmoji(text, prefix)
	t.is(result, emojiTrue + ' 42')
})

test('own true prefix', async t => {
	const result = await prefixEmoji('42', true, {
		prefixTrue: 'foo'
	})
	t.is(result, 'foo 42')
})

test('own false prefix', async t => {
	const result = await prefixEmoji('42', false, {
		prefixFalse: 'bar'
	})
	t.is(result, 'bar 42')
})
