function createHandlerMiddleware(middleware, {
  only,
  hide,
  runAfterFuncEvenWhenHidden,
  afterFunc
} = {}) {
  return async (ctx, next) => {
    if (only && !(await only(ctx))) {
      return next(ctx)
    }
    const isHidden = hide && (await hide(ctx))
    if (isHidden) {
      await next(ctx)
    } else {
      await middleware(ctx, next)
    }

    if (afterFunc && (!isHidden || runAfterFuncEvenWhenHidden)) {
      await afterFunc(ctx)
    }
  }
}

function isCallbackQueryActionFunc(actionCode, additionalConditionFunc) {
  return async ctx => {
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
