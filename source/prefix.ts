import {ConstOrPromise} from './generic-types'

type Func<Arguments extends any[], ReturnType> = (...args: Arguments) => ConstOrPromise<ReturnType>
type ConstOrFunc<Arguments extends any[], ReturnType> = ReturnType | Func<Arguments, ReturnType>

export interface PrefixOptions {
	readonly prefixTrue?: string;
	readonly prefixFalse?: string;
	readonly hideTrueEmoji?: boolean;
	readonly hideFalseEmoji?: boolean;
}

export const emojiTrue = '✅'
export const emojiFalse = '🚫'

export async function prefixEmoji<Arguments extends any[]>(text: ConstOrFunc<Arguments, string>, prefix: ConstOrFunc<Arguments, string | boolean | undefined>, options: PrefixOptions = {}, ...args: Arguments): Promise<string> {
	const internalOptions = {
		...options,
		prefixTrue: options.prefixTrue ?? emojiTrue,
		prefixFalse: options.prefixFalse ?? emojiFalse
	}

	const prefixResult = typeof prefix === 'function' ? await prefix(...args) : prefix
	const prefixContent = applyOptionsToPrefix(prefixResult, internalOptions)

	return prefixText(text, prefixContent, ...args)
}

function applyOptionsToPrefix(prefix: string | boolean | undefined, options: PrefixOptions): string | undefined {
	const {
		prefixFalse,
		prefixTrue,
		hideFalseEmoji,
		hideTrueEmoji
	} = options

	if (prefix === true) {
		if (hideTrueEmoji) {
			return undefined
		}

		return prefixTrue
	}

	if (prefix === false) {
		if (hideFalseEmoji) {
			return undefined
		}

		return prefixFalse
	}

	return prefix
}

export async function prefixText<Arguments extends any[]>(text: ConstOrFunc<Arguments, string>, prefix: ConstOrFunc<Arguments, string | undefined>, ...args: Arguments): Promise<string> {
	const textResult = typeof text === 'function' ? await text(...args) : text
	const prefixResult = typeof prefix === 'function' ? await prefix(...args) : prefix

	if (!prefixResult) {
		return textResult
	}

	return `${prefixResult} ${textResult}`
}
