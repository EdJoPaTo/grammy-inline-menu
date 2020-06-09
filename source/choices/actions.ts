import {isObject, isRegExpExecArray, ConstOrContextFunc, ContextPathFunc} from '../generic-types'

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

export function combineHideAndChoices<Context>(choices: ConstOrContextFunc<Context, Choices>, hide: undefined | ContextPathFunc<Context, boolean>): ContextPathFunc<Context, boolean> {
	return async (context, path) => {
		if (await hide?.(context, path)) {
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
