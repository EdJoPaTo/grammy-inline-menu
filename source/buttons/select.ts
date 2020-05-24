import {CallbackButtonTemplate} from '../keyboard'
import {ConstOrPromise, ConstOrContextFunc} from '../generic-types'
import {getChoiceKeysFromChoices} from '../choices/understand-choices'
import {ManyChoicesOptions, Choices, createChoiceTextFunction, generateChoicesPaginationButtons} from '../choices'
import {PrefixOptions, prefixEmoji} from '../prefix'

import {getButtonsOfPage, getButtonsAsRows} from './align'

export type ChoiceIsSetFunc<Context> = (context: Context, key: string) => ConstOrPromise<boolean>
export type ChoiceSetFunc<Context> = (context: Context, key: string, newState: boolean) => ConstOrPromise<void>

export interface SelectOptions<Context> extends ManyChoicesOptions<Context>, PrefixOptions {
	readonly multiselect?: boolean;
	readonly isSet: ChoiceIsSetFunc<Context>;
	readonly set: ChoiceSetFunc<Context>;
}

export function generateSelectButtons<Context>(actionPrefix: string, choices: ConstOrContextFunc<Context, Choices>, options: SelectOptions<Context>): (context: Context) => Promise<CallbackButtonTemplate[][]> {
	return async context => {
		if (await options.hide?.(context)) {
			return []
		}

		const choicesConstant = typeof choices === 'function' ? await choices(context) : choices
		const choiceKeys = getChoiceKeysFromChoices(choicesConstant)
		const textFunction = createChoiceTextFunction(choicesConstant, options.buttonText)
		const currentPage = await options.getCurrentPage?.(context)
		const keysOfPage = getButtonsOfPage(choiceKeys, options.columns, options.maxRows, currentPage)
		const buttonsOfPage = await Promise.all(keysOfPage
			.map(async key => {
				const textResult = await textFunction(context, key)
				const state = await options.isSet(context, key)
				const text = prefixEmoji(textResult, state, {
					hideFalseEmoji: !options.multiselect,
					...options
				})

				const dropinLetter = state ? 'F' : 'T'
				const relativePath = actionPrefix + dropinLetter + ':' + key
				return {text, relativePath}
			})
		)
		const rows = getButtonsAsRows(buttonsOfPage, options.columns)

		if (options.setPage) {
			rows.push(generateChoicesPaginationButtons(actionPrefix, choiceKeys.length, currentPage, options))
		}

		return rows
	}
}
