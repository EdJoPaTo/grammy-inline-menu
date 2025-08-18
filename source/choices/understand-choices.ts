import type {Choices, ChoicesArray, ChoicesMap} from './types.ts';

function choicesIsArray(choices: Choices): choices is ChoicesArray {
	return Array.isArray(choices);
}

function choicesIsMap(choices: Choices): choices is ChoicesMap {
	return choices instanceof Map;
}

export function getChoiceKeysFromChoices(choices: Choices): string[] {
	if (choicesIsArray(choices)) {
		return choices.map(String);
	}

	if (choicesIsMap(choices)) {
		return [...choices.keys()].map(String);
	}

	return Object.keys(choices);
}

export function getChoiceTextByKey(choices: Choices, key: string): string {
	if (choicesIsArray(choices)) {
		return key;
	}

	if (choicesIsMap(choices)) {
		return choices.get(key) ?? key;
	}

	const choice = choices[key];
	if (choice) {
		return choice;
	}

	return key;
}

export function ensureCorrectChoiceKeys(
	uniqueIdentifierPrefix: string,
	path: string,
	choiceKeys: readonly string[],
): void {
	const containSlashExample = choiceKeys.find(o => o.includes('/'));
	if (containSlashExample) {
		throw new Error(`Choices can not contain '/'. Found '${containSlashExample}' in unique identifier '${uniqueIdentifierPrefix}' at path '${path}'.`);
	}
}
