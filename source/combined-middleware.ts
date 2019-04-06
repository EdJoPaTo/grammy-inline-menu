type ContextFunc<T> = (ctx: any) => Promise<T> | T
type ContextNextFunc<T> = (ctx: any, next?: any) => Promise<T> | T

interface AfterFunc {
  runEvenWhenHidden: boolean;
  func: ContextFunc<void>;
}

export default class CombinedMiddleware {
  private readonly _only: ContextFunc<boolean>[] = [];

  private readonly _hide: ContextFunc<boolean>[] = [];

  private readonly _afterFunc: AfterFunc[] = [];

  constructor(
    private readonly mainFunc: ContextNextFunc<void>,
    private readonly hiddenFunc?: ContextNextFunc<void>
  ) {}

  addOnly(func: ContextFunc<boolean>): CombinedMiddleware {
    this._only.push(func)
    return this
  }

  addHide(func: ContextFunc<boolean>): CombinedMiddleware {
    this._hide.push(func)
    return this
  }

  addAfterFunc(func: ContextFunc<void>, runEvenWhenHidden = false): CombinedMiddleware {
    this._afterFunc.push({
      func,
      runEvenWhenHidden
    })
    return this
  }

  middleware(): (ctx: any, next: any) => Promise<void> {
    return async (ctx: any, next: any) => {
      const onlyResults = await Promise.all(
        this._only.map(async o => o(ctx))
      )
      if (onlyResults.some(o => o !== true)) {
        return next(ctx)
      }

      const hiddenResults = await Promise.all(
        this._hide.map(async o => o(ctx))
      )
      const isHidden = hiddenResults.some(o => o === true)

      if (isHidden) {
        if (this.hiddenFunc) {
          await this.hiddenFunc(ctx, next)
        } else {
          await next(ctx)
        }
      } else {
        await this.mainFunc(ctx, next)
      }

      await Promise.all(
        this._afterFunc
          .filter(o => o.runEvenWhenHidden || !isHidden)
          .map(async o => o.func(ctx))
      )
    }
  }
}
