import {ContextFunc} from './generic-types'
import ActionCode from './action-code'

export function isCallbackQueryActionFunc(actionCode: ActionCode): ContextFunc<boolean> {
  return async ctx => {
    if (ctx.updateType !== 'callback_query' || !ctx.callbackQuery) {
      return false
    }

    // TODO: Telegraf typings ctx.match can be null
    ctx.match = actionCode.exec(ctx.callbackQuery.data ?? '') ?? undefined
    if (!ctx.match) {
      return false
    }

    return true
  }
}
