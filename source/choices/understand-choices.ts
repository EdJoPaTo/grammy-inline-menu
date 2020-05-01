import {Choices, ChoicesArray, ChoicesMap} from './types'

export function choicesIsArray(choices: Choices): choices is ChoicesArray {
	return Array.isArray(choices)
}

export function choicesIsMap(choices: Choices): choices is ChoicesMap {
	return choices instanceof Map
}

export function getChoiceKeysFromChoices(choices: Choices): string[] {
	if (choicesIsArray(choices)) {
		return choices.map(o => String(o))
	}

	if (choicesIsMap(choices)) {
		return [...choices.keys()]
	}

	return Object.keys(choices)
}

export function getChoiceTextByKey(choices: Choices, key: string): string {
	if (choicesIsArray(choices)) {
		return key
	}

	if (choicesIsMap(choices)) {
		return choices.get(key) ?? key
	}

	if (choices[key]) {
		return choices[key]
	}

	return key
}
