import {
	getButtonsAsRows,
	getButtonsOfPage,
	maximumButtonsPerPage,
} from '../buttons/align.js';
import {createPaginationChoices} from '../buttons/pagination.js';
import type {CallbackButtonTemplate} from '../keyboard.js';
import type {Choices, ChoiceTextFunc, ManyChoicesOptions} from './types.js';
import {
	ensureCorrectChoiceKeys,
	getChoiceKeysFromChoices,
	getChoiceTextByKey,
} from './understand-choices.js';

export function generateChoicesButtons<Context>(
	uniqueIdentifierPrefix: string,
	isSubmenu: boolean,
	options: ManyChoicesOptions<Context>,
): (context: Context, path: string) => Promise<CallbackButtonTemplate[][]> {
	return async (context, path) => {
		if (await options.hide?.(context, path)) {
			return [];
		}

		const choicesConstant = typeof options.choices === 'function'
			? await options.choices(context)
			: options.choices;
		const choiceKeys = getChoiceKeysFromChoices(choicesConstant);
		ensureCorrectChoiceKeys(uniqueIdentifierPrefix, path, choiceKeys);
		const textFunction = createChoiceTextFunction(
			choicesConstant,
			options.buttonText,
		);
		const currentPage = await options.getCurrentPage?.(context);
		const keysOfPage = getButtonsOfPage(
			choiceKeys,
			options.columns,
			options.maxRows,
			currentPage,
		);
		const buttonsOfPage = await Promise.all(keysOfPage.map(async key => {
			const text = await textFunction(context, key);
			const relativePath = uniqueIdentifierPrefix + ':' + key
				+ (isSubmenu ? '/' : '');
			return {text, relativePath};
		}));
		const rows = getButtonsAsRows(buttonsOfPage, options.columns);

		if (options.setPage) {
			rows.push(generateChoicesPaginationButtons(
				uniqueIdentifierPrefix,
				choiceKeys.length,
				currentPage,
				options,
			));
		}

		return rows;
	};
}

export function generateChoicesPaginationButtons<Context>(
	uniqueIdentifierPrefix: string,
	choiceKeys: number,
	currentPage: number | undefined,
	options: ManyChoicesOptions<Context>,
): CallbackButtonTemplate[] {
	const entriesPerPage = maximumButtonsPerPage(
		options.columns,
		options.maxRows,
	);
	const totalPages = choiceKeys / entriesPerPage;
	const pageRecord = createPaginationChoices(totalPages, currentPage);
	const pageKeys = Object.keys(pageRecord).map(Number);
	const pageButtons = pageKeys.map((page): CallbackButtonTemplate => ({
		relativePath: `${uniqueIdentifierPrefix}P:${page}`,
		text: pageRecord[page]!,
	}));

	return pageButtons;
}

export function createChoiceTextFunction<Context>(
	choices: Choices,
	buttonText: undefined | ChoiceTextFunc<Context>,
): ChoiceTextFunc<Context> {
	if (buttonText) {
		return buttonText;
	}

	return (_, key) => getChoiceTextByKey(choices, key);
}
