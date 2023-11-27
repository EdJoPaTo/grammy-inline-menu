import {strictEqual} from 'node:assert';
import {test} from 'node:test';
import {prefixText} from './prefix.js';

await test('prefixText no prefix', () => {
	const result = prefixText('42', undefined);
	strictEqual(result, '42');
});

await test('prefixText value text & prefix', () => {
	const result = prefixText('42', '6');
	strictEqual(result, '6 42');
});
