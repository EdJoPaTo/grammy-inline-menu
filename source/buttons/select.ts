import {
	createChoiceTextFunction,
	generateChoicesPaginationButtons,
	type ManyChoicesOptions,
} from '../choices/index.js';
import {
	ensureCorrectChoiceKeys,
	getChoiceKeysFromChoices,
} from '../choices/understand-choices.js';
import type {ConstOrPromise} from '../generic-types.js';
import type {CallbackButtonTemplate} from '../keyboard.js';
import {prefixEmoji} from '../prefix.js';
import {getButtonsAsRows, getButtonsOfPage} from './align.js';

export type IsSetFunction<Context> = (
	context: Context,
	key: string,
) => ConstOrPromise<boolean>;
export type SetFunction<Context> = (
	context: Context,
	key: string,
	newState: boolean,
) => ConstOrPromise<string | boolean>;
export type FormatStateFunction<Context> = (
	context: Context,
	textResult: string,
	state: boolean,
	key: string,
) => ConstOrPromise<string>;

export interface SelectOptions<Context> extends ManyChoicesOptions<Context> {
	/**
	 * Show an emoji for the choices currently false.
	 * This is helpful to show the user there can be selected multiple choices at the same time.
	 */
	readonly showFalseEmoji?: boolean;

	/** Function returning the current state of a given choice. */
	readonly isSet: IsSetFunction<Context>;

	/**
	 * Function which is called when a user selects a choice.
	 * Arguments include the choice (`key`) and the new `state` which is helpful for multiple toggles.
	 */
	readonly set: SetFunction<Context>;

	/** Format the button text which is visible to the user. */
	readonly formatState?: FormatStateFunction<Context>;
}

export function generateSelectButtons<Context>(
	uniqueIdentifierPrefix: string,
	options: SelectOptions<Context>,
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
		const formatFunction: FormatStateFunction<Context> = options.formatState
			?? ((_, textResult, state) =>
				prefixEmoji(textResult, state, {
					hideFalseEmoji: !options.showFalseEmoji,
				}));
		const currentPage = await options.getCurrentPage?.(context);
		const keysOfPage = getButtonsOfPage(
			choiceKeys,
			options.columns,
			options.maxRows,
			currentPage,
		);
		const buttonsOfPage = await Promise.all(keysOfPage
			.map(async key => {
				const textResult = await textFunction(context, key);
				const state = await options.isSet(context, key);
				const text = await formatFunction(context, textResult, state, key);

				const dropinLetter = state ? 'F' : 'T';
				const relativePath = uniqueIdentifierPrefix + dropinLetter + ':' + key;
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
