const {Markup} = require('telegraf')

async function buildKeyboard(buttons, ctx) {
  const resultButtons = await Promise.all(buttons.map(async row => {
    if (typeof row === 'function') {
      const rows = await row(ctx)
      return Promise.all(rows.map(row => buildKeyboardRow(row, ctx)))
    }
    return [await buildKeyboardRow(row, ctx)]
  }))
  const resultButtonsFlatted = [].concat(...resultButtons)
  return Markup.inlineKeyboard(resultButtonsFlatted)
}

async function buildKeyboardRow(row, ctx) {
  const result = await Promise.all(row.map(buttonInfo => buildKeyboardButton(buttonInfo, ctx)))
  return result
}

async function buildKeyboardButton({text, textPrefix, actionCode, hide}, ...args) {
  if (hide) {
    hide = await hide(...args)
    if (hide) {
      return {hide: true}
    }
  }

  if (typeof text === 'function') {
    text = await text(...args)
  }
  if (textPrefix) {
    if (typeof textPrefix === 'function') {
      textPrefix = await textPrefix(...args)
    }
    if (String(textPrefix).length > 0) {
      text = textPrefix + ' ' + text
    }
  }

  if (typeof actionCode === 'function') {
    actionCode = await actionCode(...args)
  }

  return Markup.callbackButton(text, actionCode)
}

module.exports = {
  buildKeyboard,
  buildKeyboardRow,
  buildKeyboardButton
}
