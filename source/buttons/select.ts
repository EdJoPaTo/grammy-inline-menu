import {ButtonInfo} from '../build-keyboard'

import {getRowsOfButtons} from '../align-buttons'

type ContextKeyFunc<T> = (ctx: any, key: string) => Promise<T> | T
type ContextKeyIndexArrFunc<T> = (ctx: any, key: string, index: number, array: string[]) => Promise<T> | T

interface SelectButtonOptions {
  columns?: number;
  maxRows?: number;
  textFunc: ContextKeyIndexArrFunc<string>;
  hide?: ContextKeyFunc<boolean>;
}

export function generateSelectButtons(actionBase: string, options: string[], selectOptions: SelectButtonOptions): ButtonInfo[][] {
  const {textFunc, hide, columns, maxRows} = selectOptions
  const buttons = options.map((key, i, arr) => {
    const action = `${actionBase}-${key}`
    const textKey = async (ctx: any): Promise<string> => textFunc(ctx, key, i, arr)
    const hideKey = async (ctx: any): Promise<boolean> => hide ? hide(ctx, key) : false
    return {
      text: textKey,
      action,
      hide: hideKey
    }
  })

  return getRowsOfButtons(buttons, columns, maxRows)
}

module.exports = {
  generateSelectButtons
}
