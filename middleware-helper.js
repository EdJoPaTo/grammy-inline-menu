function createHandlerMiddleware(middleware, {
  hide,
  afterFunc,
  only
} = {}) {
  return async (ctx, next) => {
    if (only && !(await only(ctx))) {
      return next(ctx)
    }
    if (hide && (await hide(ctx))) {
      return next(ctx)
    }
    await middleware(ctx, next)
    if (afterFunc) {
      await afterFunc(ctx)
    }
  }
}

module.exports = {
  createHandlerMiddleware
}
