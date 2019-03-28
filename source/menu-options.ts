import {ContextMessageUpdate} from 'telegraf'

import ActionCode from './action-code'

type ConstOrContextFunc<T> = T | ContextFunc<T>
type ContextFunc<T> = (ctx: ContextMessageUpdate) => Promise<T> | T

export interface MenuOptions {
  actionCode?: string;
  backButtonText?: ConstOrContextFunc<string>;
  mainMenuButtonText?: ConstOrContextFunc<string>;
  log?: (...args: any[]) => void;
}

export interface InternalMenuOptions {
  hasMainMenu: boolean;
  depth: number;
  backButtonText?: ConstOrContextFunc<string>;
  mainMenuButtonText?: ConstOrContextFunc<string>;
  setParentMenuFunc?: (ctx: any, reason: string) => Promise<void>;
  log: (...args: any[]) => void;
}

export function normalizeOptions(userOptions: MenuOptions): {actionCode: ActionCode; internalOptions: InternalMenuOptions} {
  if (userOptions.actionCode && userOptions.actionCode.includes(':')) {
    throw new Error('ActionCode has to start at the base level (without ":")')
  }

  const actionCode = new ActionCode(userOptions.actionCode || 'main')
  const hasMainMenu = actionCode.get() === 'main'
  const depth = hasMainMenu ? 0 : 1

  const internalOptions: InternalMenuOptions = {
    hasMainMenu,
    depth,
    backButtonText: userOptions.backButtonText,
    mainMenuButtonText: userOptions.mainMenuButtonText,
    log: userOptions.log || (() => {})
  }

  return {
    actionCode,
    internalOptions
  }
}
