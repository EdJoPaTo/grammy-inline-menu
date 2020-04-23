import {Context as TelegrafContext} from 'telegraf'

import {InlineKeyboardButton} from 'telegram-typings'

import ActionCode from '../action-code'

import {ButtonInfo} from './types'

export async function buildKeyboardButton(buttonInfo: ButtonInfo, actionCodePrefix: string, ctx: TelegrafContext): Promise<InlineKeyboardButton | undefined> {
  const {hide, text, action, url, switchToChat, switchToCurrentChat, root} = buttonInfo

  if (hide) {
    const hideIt = await hide(ctx)
    if (hideIt) {
      return undefined
    }
  }

  const button: InlineKeyboardButton = {
    text: typeof text === 'function' ? await text(ctx) : text
  }

  if (action) {
    const thisActionResult = typeof action === 'function' ? await action(ctx) : action
    if (root) {
      button.callback_data = thisActionResult
    } else {
      button.callback_data = new ActionCode(actionCodePrefix).concat(thisActionResult).getString()
    }
  } else if (url) {
    button.url = typeof url === 'function' ? await url(ctx) : url
  } else if (switchToChat) {
    button.switch_inline_query = typeof switchToChat === 'function' ? await switchToChat(ctx) : switchToChat
  } else if (switchToCurrentChat) {
    button.switch_inline_query_current_chat = typeof switchToCurrentChat === 'function' ? await switchToCurrentChat(ctx) : switchToCurrentChat
  } else {
    throw new Error('button was not completly intialized')
  }

  return button
}
