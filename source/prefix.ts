export interface PrefixOptions {
	readonly prefixTrue?: string;
	readonly prefixFalse?: string;
	readonly hideTrueEmoji?: boolean;
	readonly hideFalseEmoji?: boolean;
}

export const emojiTrue = '✅'
export const emojiFalse = '🚫'

export function prefixEmoji(text: string, prefix: string | boolean | undefined, options: PrefixOptions = {}): string {
	const internalOptions = {
		...options,
		prefixTrue: options.prefixTrue ?? emojiTrue,
		prefixFalse: options.prefixFalse ?? emojiFalse
	}

	const prefixContent = applyOptionsToPrefix(prefix, internalOptions)

	return prefixText(text, prefixContent)
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

export function prefixText(text: string, prefix: string | undefined): string {
	if (!prefix) {
		return text
	}

	return `${prefix} ${text}`
}
