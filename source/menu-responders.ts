import {Composer, Middleware, ContextMessageUpdate} from 'telegraf'

import {ContextFunc, ContextNextFunc} from './generic-types'
import {isCallbackQueryActionFunc} from './middleware-helper'
import ActionCode from './action-code'
import CombinedMiddleware from './combined-middleware'

type MenuFunc = (ctx: any, reason: string) => Promise<void>

export interface Responder {
  middleware: ContextNextFunc;
  action?: ActionCode;
  only?: ContextFunc<boolean>;
  hide?: ContextFunc<boolean>;
  setMenuAfter?: boolean;
  setParentMenuAfter?: boolean;
}

interface ResponderEnvironment {
  actionCode: ActionCode;
  setMenuFunc: MenuFunc;
  setParentMenuFunc?: MenuFunc;
}

export default class MenuResponders {
  readonly responders: Responder[] = []

  add(responder: Responder): void {
    this.responders.push(responder)
  }

  hasSomeNonActionResponders(): boolean {
    return this.responders.some(o => o.action === undefined)
  }

  createMiddleware(environment: ResponderEnvironment): Middleware<ContextMessageUpdate> {
    const {actionCode, setMenuFunc} = environment
    const menuMiddleware = Composer.action(actionCode.get(), async ctx => setMenuFunc(ctx, 'menu action'))

    return Composer.compose([
      menuMiddleware,
      ...this.responders
        .map(o => createMiddlewareFromResponder(o, environment))
    ])
  }
}

export function createMiddlewareFromResponder(responder: Responder, environment: ResponderEnvironment): ContextNextFunc {
  const m = new CombinedMiddleware(responder.middleware)

  if (responder.only) {
    m.addOnly(responder.only)
  }

  if (responder.hide) {
    m.addHide(responder.hide)
  }

  const {actionCode, setMenuFunc, setParentMenuFunc} = environment

  if (responder.setParentMenuAfter) {
    if (!setParentMenuFunc) {
      throw new Error(`There is no parent menu for this that could be set. Remove the 'setParentMenuAfter' flag. Occured in menu ${actionCode.get()}`)
    }

    m.addAfterFunc(async ctx => setParentMenuFunc(ctx, `setParentMenuAfter ${actionCode.get()}`), Boolean(responder.action))
  } else if (responder.setMenuAfter) {
    m.addAfterFunc(async ctx => setMenuFunc(ctx, `setMenuAfter ${actionCode.get()}`), Boolean(responder.action))
  }

  if (!responder.action) {
    return m.middleware()
  }

  const childActionCode = actionCode.concat(responder.action)
  m.addOnly(isCallbackQueryActionFunc(childActionCode))

  return m.middleware()
}
