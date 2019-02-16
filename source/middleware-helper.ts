import ActionCode from './action-code'

export function isCallbackQueryActionFunc(actionCode: ActionCode): (ctx: any) => Promise<boolean> {
  return async (ctx: any) => {
    if (ctx.updateType !== 'callback_query') {
      return false
    }

    ctx.match = actionCode.exec(ctx.callbackQuery.data)
    if (!ctx.match) {
      return false
    }

    return true
  }
}
