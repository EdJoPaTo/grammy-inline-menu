/* eslint @typescript-eslint/no-unnecessary-boolean-literal-compare: off */

import {ContextFunc, ContextNextFunc} from './generic-types'

interface AfterFunc {
  runEvenWhenHidden: boolean;
  func: ContextFunc<void>;
}

export default class CombinedMiddleware {
  private readonly _only: ContextFunc<boolean>[] = []

  private readonly _hide: ContextFunc<boolean>[] = []

  private readonly _afterFunc: AfterFunc[] = []

  constructor(
    private readonly _mainFunc: ContextNextFunc,
    private readonly _hiddenFunc?: ContextNextFunc
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

  middleware(): (ctx: any, next: () => any) => Promise<void> {
    return async (ctx: any, next) => {
      const onlyResults = await Promise.all(
        this._only.map(async o => o(ctx))
      )
      if (onlyResults.some(o => o !== true)) {
        return next()
      }

      const hiddenResults = await Promise.all(
        this._hide.map(async o => o(ctx))
      )
      const isHidden = hiddenResults.some(o => o === true)

      if (isHidden) {
        if (this._hiddenFunc) {
          await this._hiddenFunc(ctx, next)
        } else {
          await next()
        }
      } else {
        await this._mainFunc(ctx, next)
      }

      await Promise.all(
        this._afterFunc
          .filter(o => o.runEvenWhenHidden || !isHidden)
          .map(async o => o.func(ctx))
      )
    }
  }
}
