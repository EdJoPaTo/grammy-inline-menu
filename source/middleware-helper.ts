import {ContextMessageUpdate} from 'telegraf'

import ActionCode from './action-code'

export function isCallbackQueryActionFunc(actionCode: ActionCode): (ctx: any) => Promise<boolean> {
  return async (ctx: ContextMessageUpdate) => {
    if (ctx.updateType !== 'callback_query' || !ctx.callbackQuery) {
      return false
    }

    ctx.match = actionCode.exec(ctx.callbackQuery.data || '') || undefined
    if (!ctx.match) {
      return false
    }

    return true
  }
}
