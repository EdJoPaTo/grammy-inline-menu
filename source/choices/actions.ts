import type {ConstOrContextFunc, ContextPathFunc} from '../generic-types.js';
import type {Choices} from './types.js';
import {getChoiceKeysFromChoices} from './understand-choices.js';

export function combineHideAndChoices<Context>(
	actionPrefix: string,
	choices: ConstOrContextFunc<Context, Choices>,
	hide: undefined | ContextPathFunc<Context, boolean>,
): ContextPathFunc<Context, boolean> {
	return async (context, path) => {
		if (await hide?.(context, path)) {
			return true;
		}

		const match = new RegExp('/' + actionPrefix + ':([^/]+)/?$').exec(path);
		const toBeFound = match?.[1];
		if (!toBeFound) {
			throw new TypeError('could not read choice from path');
		}

		const choicesConstant = typeof choices === 'function'
			? await choices(context)
			: choices;
		const choiceKeys = getChoiceKeysFromChoices(choicesConstant);
		const keyExists = choiceKeys.includes(toBeFound);
		if (!keyExists) {
			return true;
		}

		return false;
	};
}
