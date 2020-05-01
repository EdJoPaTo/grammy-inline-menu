import {isObject, isRegExpExecArray, ConstOrContextFunc, ContextFunc} from '../generic-types'

import {getChoiceKeysFromChoices} from './understand-choices'
import {Choices} from './types'

export function getKeyFromContext(context: unknown): string | undefined {
	const match = isObject(context) && isObject(context.callbackQuery) && isRegExpExecArray(context.match) && context.match
	if (!match) {
		return undefined
	}

	const key = match.slice(-1)[0]
	return key
}

export function combineHideAndChoices<Context>(choices: ConstOrContextFunc<Context, Choices>, hide: undefined | ContextFunc<Context, boolean>): ContextFunc<Context, boolean> {
	return async context => {
		if (await hide?.(context)) {
			return true
		}

		const toBeFound = getKeyFromContext(context)
		if (toBeFound) {
			const choicesConstant = typeof choices === 'function' ? await choices(context) : choices
			const choiceKeys = getChoiceKeysFromChoices(choicesConstant)
			const keyExists = choiceKeys.includes(toBeFound)
			if (!keyExists) {
				return true
			}
		}

		return false
	}
}
