import {strictEqual} from 'node:assert';
import {test} from 'node:test';
import {emojiFalse, emojiTrue, prefixEmoji} from './prefix.js';

await test('prefixEmoji no prefix', () => {
	const result = prefixEmoji('42', undefined);
	strictEqual(result, '42');
});

await test('prefixEmoji value text & prefix truthy still passthrough', () => {
	const result = prefixEmoji('42', '6');
	strictEqual(result, '6 42');
});

await test('prefixEmoji value text & prefix true', () => {
	const result = prefixEmoji('42', true);
	strictEqual(result, emojiTrue + ' 42');
});

await test('prefixEmoji value text & prefix false', () => {
	const result = prefixEmoji('42', false);
	strictEqual(result, emojiFalse + ' 42');
});

await test('prefixEmoji value text & prefix true hidden', () => {
	const result = prefixEmoji('42', true, {hideTrueEmoji: true});
	strictEqual(result, '42');
});

await test('prefixEmoji value text & prefix false hidden', () => {
	const result = prefixEmoji('42', false, {hideFalseEmoji: true});
	strictEqual(result, '42');
});

await test('prefixEmoji own true prefix', () => {
	const result = prefixEmoji('42', true, {
		prefixTrue: 'foo',
	});
	strictEqual(result, 'foo 42');
});

await test('prefixEmoji own false prefix', () => {
	const result = prefixEmoji('42', false, {
		prefixFalse: 'bar',
	});
	strictEqual(result, 'bar 42');
});
