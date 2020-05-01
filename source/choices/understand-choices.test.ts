import test from 'ava'

import {getChoiceKeysFromChoices, getChoiceTextByKey} from './understand-choices'

test('getChoiceKeysFromChoices from array', t => {
	const choices = ['A', 'B']
	const keys = getChoiceKeysFromChoices(choices)
	t.deepEqual(keys, ['A', 'B'])
})

test('getChoiceKeysFromChoices from record', t => {
	const choices = {A: 'Aaa', B: 'Bbb'}
	const keys = getChoiceKeysFromChoices(choices)
	t.deepEqual(keys, ['A', 'B'])
})

test('getChoiceKeysFromChoices from map', t => {
	const choices: Map<string, string> = new Map()
	choices.set('A', 'Aaa')
	choices.set('B', 'Bbb')
	const keys = getChoiceKeysFromChoices(choices)
	t.deepEqual(keys, ['A', 'B'])
})

test('getChoiceTextByKey from array', t => {
	const choices = ['A', 'B']
	const text = getChoiceTextByKey(choices, 'A')
	t.is(text, 'A')
})

test('getChoiceTextByKey from record', t => {
	const choices = {A: 'Aaa', B: 'Bbb'}
	const text = getChoiceTextByKey(choices, 'A')
	t.is(text, 'Aaa')
})

test('getChoiceTextByKey from map', t => {
	const choices: Map<string, string> = new Map()
	choices.set('A', 'Aaa')
	choices.set('B', 'Bbb')
	const text = getChoiceTextByKey(choices, 'A')
	t.is(text, 'Aaa')
})

test('getChoiceTextByKey from record but undefined', t => {
	const choices = {A: 'Aaa', B: 'Bbb'}
	const text = getChoiceTextByKey(choices, 'C')
	t.is(text, 'C')
})

test('getChoiceTextByKey from map but undefined', t => {
	const choices: Map<string, string> = new Map()
	choices.set('A', 'Aaa')
	choices.set('B', 'Bbb')
	const text = getChoiceTextByKey(choices, 'C')
	t.is(text, 'C')
})
