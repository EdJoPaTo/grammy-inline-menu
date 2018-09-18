function createHandlerMiddleware(middleware, {
  hide,
  afterFunc,
  runAfterFuncEvenWhenHidden,
  only
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

module.exports = {
  createHandlerMiddleware
}
