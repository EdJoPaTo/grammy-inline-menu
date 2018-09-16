const {Markup} = require('telegraf')

async function buildKeyboard(buttons, actionCodePrefix, ctx) {
  const resultButtons = await Promise.all(buttons.map(async row => {
    if (typeof row === 'function') {
      const rows = await row(ctx)
      return Promise.all(rows.map(row => buildKeyboardRow(row, actionCodePrefix, ctx)))
    }
    return [await buildKeyboardRow(row, actionCodePrefix, ctx)]
  }))
  const resultButtonsFlatted = [].concat(...resultButtons)
  return Markup.inlineKeyboard(resultButtonsFlatted)
}

async function buildKeyboardRow(row, ...args) {
  const result = await Promise.all(row.map(buttonInfo => buildKeyboardButton(buttonInfo, ...args)))
  return result
}

async function buildKeyboardButton({
  action,
  hide,
  root,
  switchToChat,
  switchToCurrentChat,
  text,
  url
}, actionCodePrefix, ...args) {
  if (hide) {
    hide = await hide(...args)
    if (hide) {
      return {hide: true}
    }
  }

  if (typeof text === 'function') {
    text = await text(...args)
  }
  if (typeof action === 'function') {
    action = await action(...args)
  }
  if (action && !root) {
    action = actionCodePrefix.concat(action).get()
  }

  const buttonWithPromises = {
    text,
    hide: false
  }

  if (action) {
    buttonWithPromises.callback_data = action
  } else if (url) {
    buttonWithPromises.url = url
  } else if (switchToChat) {
    buttonWithPromises.switch_inline_query = switchToChat
  } else if (switchToCurrentChat) {
    buttonWithPromises.switch_inline_query_current_chat = switchToCurrentChat
  } else {
    throw new Error('button was not completly intialized')
  }

  const button = {}
  Object.keys(buttonWithPromises)
    .forEach(async key => {
      if (typeof buttonWithPromises[key] === 'function') {
        button[key] = await buttonWithPromises[key](...args)
      } else {
        button[key] = buttonWithPromises[key]
      }
    })
  return button
}

module.exports = {
  buildKeyboard,
  buildKeyboardRow,
  buildKeyboardButton
}
