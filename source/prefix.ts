export const emojiTrue = '✅'
export const emojiFalse = '🚫'

type ConstOrFunc<T> = T | ((...args: any[]) => Promise<T> | T)

export interface PrefixOptions {
  prefixTrue?: string;
  prefixFalse?: string;
  hideTrueEmoji?: boolean;
  hideFalseEmoji?: boolean;
}

export async function prefixEmoji(text: ConstOrFunc<string>, prefix: ConstOrFunc<string | boolean | undefined>, options: PrefixOptions = {}, ...args: any[]): Promise<string> {
  if (!options.prefixTrue) {
    options.prefixTrue = emojiTrue
  }

  if (!options.prefixFalse) {
    options.prefixFalse = emojiFalse
  }

  const prefixResult = typeof prefix === 'function' ? await prefix(...args) : prefix
  const prefixContent = applyOptionsToPrefix(prefixResult, options)

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

export async function prefixText(text: ConstOrFunc<string>, prefix: ConstOrFunc<string | undefined>, ...args: any[]): Promise<string> {
  const textResult = typeof text === 'function' ? await text(...args) : text
  const prefixResult = typeof prefix === 'function' ? await prefix(...args) : prefix

  if (!prefixResult) {
    return textResult
  }

  return `${prefixResult} ${textResult}`
}
