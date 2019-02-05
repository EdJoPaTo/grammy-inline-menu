import ActionCode from './action-code'

type ContextFunc<T> = (ctx: any) => Promise<T> | T
type ContextNextFunc<T> = (ctx: any, next: any) => Promise<T> | T

export interface HandlerOptions {
  only?: ContextFunc<boolean>;
  hide?: ContextFunc<boolean>;
  hiddenFunc?: ContextNextFunc<void>;
  runAfterFuncEvenWhenHidden?: boolean;
  afterFunc?: ContextFunc<boolean>;
}

export function createHandlerMiddleware(middleware: ContextNextFunc<void>, options: HandlerOptions = {}): (ctx: any, next: any) => Promise<void> {
  const {only, hide, hiddenFunc, runAfterFuncEvenWhenHidden, afterFunc} = options
  return async (ctx: any, next: any) => {
    if (only && !(await only(ctx))) {
      return next(ctx)
    }

    const isHidden = hide && (await hide(ctx))
    if (isHidden) {
      if (hiddenFunc) {
        await hiddenFunc(ctx, next)
      } else {
        await next(ctx)
      }
    } else {
      await middleware(ctx, next)
    }

    if (afterFunc && (!isHidden || runAfterFuncEvenWhenHidden)) {
      await afterFunc(ctx)
    }
  }
}

export function isCallbackQueryActionFunc(actionCode: ActionCode, additionalConditionFunc?: ContextFunc<boolean>): (ctx: any) => Promise<boolean> {
  return async (ctx: any) => {
    if (ctx.updateType !== 'callback_query') {
      return false
    }

    ctx.match = actionCode.exec(ctx.callbackQuery.data)
    if (!ctx.match) {
      return false
    }

    if (additionalConditionFunc && !(await additionalConditionFunc(ctx))) {
      return false
    }

    return true
  }
}

module.exports = {
  createHandlerMiddleware,
  isCallbackQueryActionFunc
}
