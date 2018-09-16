const emojiTrue = '✅'
const emojiFalse = '🚫'

async function prefixEmoji(text, prefix, options = {}, ...args) {
  if (!options.prefixTrue) {
    options.prefixTrue = emojiTrue
  }
  if (!options.prefixFalse) {
    options.prefixFalse = emojiFalse
  }
  const {
    prefixFalse,
    prefixTrue,
    hideFalseEmoji,
    hideTrueEmoji
  } = options

  if (typeof prefix === 'function') {
    prefix = await prefix(...args)
  }

  if (prefix === true) {
    if (hideTrueEmoji) {
      prefix = undefined
    } else {
      prefix = prefixTrue
    }
  }
  if (prefix === false) {
    if (hideFalseEmoji) {
      prefix = undefined
    } else {
      prefix = prefixFalse
    }
  }

  return prefixText(text, prefix, ...args)
}

async function prefixText(text, prefix, ...args) {
  if (typeof text === 'function') {
    text = text(...args)
  }
  if (typeof prefix === 'function') {
    prefix = await prefix(...args)
  }

  if (!prefix) {
    return text
  }
  return `${prefix} ${await text}`
}

module.exports = {
  emojiFalse,
  emojiTrue,
  prefixEmoji,
  prefixText
}
