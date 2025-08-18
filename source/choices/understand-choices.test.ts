import {deepStrictEqual, strictEqual, throws} from 'node:assert';
import {test} from 'node:test';
import {
	ensureCorrectChoiceKeys,
	getChoiceKeysFromChoices,
	getChoiceTextByKey,
} from './understand-choices.ts';

await test('getChoiceKeysFromChoices from array', () => {
	const choices = ['A', 'B', 1];
	const keys = getChoiceKeysFromChoices(choices);
	deepStrictEqual(keys, ['A', 'B', '1']);
});

await test('getChoiceKeysFromChoices from record', () => {
	const choices = {A: 'Aaa', B: 'Bbb', 1: '111'};
	const keys = getChoiceKeysFromChoices(choices);
	// A Record is not ordered. Numbers are always before text keys
	deepStrictEqual(keys, ['1', 'A', 'B']);
});

await test('getChoiceKeysFromChoices from map', () => {
	const choices = new Map<string | number, string>();
	choices.set('A', 'Aaa');
	choices.set('B', 'Bbb');
	choices.set(1, '111');
	const keys = getChoiceKeysFromChoices(choices);
	deepStrictEqual(keys, ['A', 'B', '1']);
});

await test('getChoiceTextByKey from array', () => {
	const choices = ['A', 'B'];
	const text = getChoiceTextByKey(choices, 'A');
	strictEqual(text, 'A');
});

await test('getChoiceTextByKey from record', () => {
	const choices = {A: 'Aaa', B: 'Bbb'};
	const text = getChoiceTextByKey(choices, 'A');
	strictEqual(text, 'Aaa');
});

await test('getChoiceTextByKey from map', () => {
	const choices = new Map<string, string>();
	choices.set('A', 'Aaa');
	choices.set('B', 'Bbb');
	const text = getChoiceTextByKey(choices, 'A');
	strictEqual(text, 'Aaa');
});

await test('getChoiceTextByKey from record but undefined', () => {
	const choices = {A: 'Aaa', B: 'Bbb'};
	const text = getChoiceTextByKey(choices, 'C');
	strictEqual(text, 'C');
});

await test('getChoiceTextByKey from map but undefined', () => {
	const choices = new Map<string, string>();
	choices.set('A', 'Aaa');
	choices.set('B', 'Bbb');
	const text = getChoiceTextByKey(choices, 'C');
	strictEqual(text, 'C');
});

await test('ensureCorrectChoiceKeys correct keys are not a problem', () => {
	const choiceKeys = ['a', 'A', 'a:A', 'aaaaaaaaaaa'];
	ensureCorrectChoiceKeys('', '/', choiceKeys);
});

await test('ensureCorrectChoiceKeys slash throws', () => {
	const choiceKeys = ['a/a'];
	throws(
		() => {
			ensureCorrectChoiceKeys('prefix', '/path/', choiceKeys);
		},
		{message: /can not contain '\/'.+prefix.+\/path\//},
	);
});
