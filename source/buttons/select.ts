import {Context as TelegrafContext} from 'telegraf'

import {ContextFunc, ContextKeyFunc, ContextKeyIndexArrFunc} from '../generic-types'
import {prefixEmoji, PrefixOptions} from '../prefix'

import {getRowsOfButtons} from './align'
import {KeyboardPart, ButtonInfo} from './types'

type OptionsDict = Record<string | number, string>
type OptionsArr = readonly (string | number)[]
export type SelectOptions = OptionsArr | OptionsDict

interface SelectButtonOptions {
  columns?: number;
  maxRows?: number;
  currentPage?: number;
  textFunc: ContextKeyIndexArrFunc<string>;
  hide?: ContextKeyFunc<boolean>;
}

export function generateSelectButtons(actionBase: string, options: OptionsArr, selectOptions: SelectButtonOptions): KeyboardPart {
  const {textFunc, hide, columns, maxRows, currentPage} = selectOptions
  const buttons = options
    .map(o => String(o))
    .map((key, index, array): ButtonInfo => {
      const action = `${actionBase}-${key}`
      return {
        text: async ctx => textFunc(ctx, key, index, array),
        action,
        hide: async ctx => hide ? hide(ctx, key) : false
      }
    })

  return getRowsOfButtons(buttons, columns, maxRows, currentPage)
}

export interface SelectButtonCreatorOptions extends PrefixOptions {
  getCurrentPage?: ContextFunc<number | undefined>;
  textFunc?: ContextKeyIndexArrFunc<string>;
  prefixFunc?: ContextKeyIndexArrFunc<string>;
  isSetFunc?: ContextKeyFunc<boolean>;
  multiselect?: boolean;
  hide?: ContextKeyFunc<boolean>;
}

export function selectButtonCreator(action: string, optionsFunc: ContextFunc<SelectOptions>, additionalArgs: SelectButtonCreatorOptions): ContextFunc<KeyboardPart> {
  const {getCurrentPage, textFunc, prefixFunc, isSetFunc, multiselect} = additionalArgs
  return async ctx => {
    const optionsResult: OptionsArr | OptionsDict = await optionsFunc(ctx)
    const keys = Array.isArray(optionsResult) ? optionsResult : Object.keys(optionsResult)
    const currentPage = getCurrentPage && await getCurrentPage(ctx)
    const fallbackKeyTextFunc = Array.isArray(optionsResult) ?
      (_ctx: any, key: string) => key :
      (_ctx: any, key: string) => (optionsResult as OptionsDict)[key]
    const textOnlyFunc = textFunc ?? fallbackKeyTextFunc
    const keyTextFunc: ContextKeyIndexArrFunc<string> = async (...args) => prefixEmoji(textOnlyFunc, prefixFunc ?? isSetFunc, {
      hideFalseEmoji: !multiselect,
      ...additionalArgs
    }, ...args)
    return generateSelectButtons(action, keys, {
      ...additionalArgs,
      textFunc: keyTextFunc,
      currentPage
    })
  }
}

export function selectHideFunc(keyFromCtx: (ctx: TelegrafContext) => string, optionsFunc: ContextFunc<SelectOptions>, userHideFunc?: ContextKeyFunc<boolean>): ContextFunc<boolean> {
  return async ctx => {
    const key = keyFromCtx(ctx)
    const optionsResult = await optionsFunc(ctx)
    const keys = Array.isArray(optionsResult) ? optionsResult : Object.keys(optionsResult)
    if (!keys.map(o => String(o)).includes(key)) {
      return true
    }

    if (userHideFunc && await userHideFunc(ctx, key)) {
      return true
    }

    return false
  }
}
