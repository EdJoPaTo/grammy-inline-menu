import {Composer, Middleware, ContextMessageUpdate} from 'telegraf'
import ActionCode from './action-code'
import {createHandlerMiddleware, HandlerOptions, isCallbackQueryActionFunc} from './middleware-helper'

type ContextFunc<T> = (ctx: any) => Promise<T> | T
type ContextNextMinimumFunc = (ctx: any, next?: any) => Promise<void> | void
type ContextNextFunc = (ctx: any, next: any) => Promise<void>
type MenuFunc = (ctx: any, reason: string) => Promise<void>

export interface Responder {
  middleware: ContextNextMinimumFunc;
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

class MenuResponders {
  readonly responders: Responder[] = []

  add(responder: Responder): void {
    this.responders.push(responder)
  }

  hasSomeNonActionResponders(): boolean {
    return this.responders.some(o => o.action === undefined)
  }

  createMiddleware(environment: ResponderEnvironment): Middleware<ContextMessageUpdate> {
    const {actionCode, setMenuFunc} = environment
    const menuMiddleware = Composer.action(actionCode.get(), ctx => setMenuFunc(ctx, 'menu action'))

    return Composer.compose([
      menuMiddleware,
      ...this.responders
        .map(o => createMiddlewareFromResponder(o, environment))
    ])
  }
}

export function createMiddlewareFromResponder(responder: Responder, environment: ResponderEnvironment): ContextNextFunc {
  const handler: HandlerOptions = {}

  handler.only = responder.only
  handler.hide = responder.hide

  const {actionCode, setMenuFunc, setParentMenuFunc} = environment

  if (responder.setParentMenuAfter) {
    if (!setParentMenuFunc) {
      throw new Error(`There is no parent menu for this that could be set. Remove the 'setParentMenuAfter' flag. Occured in menu ${actionCode.get()}`)
    }

    handler.afterFunc = ctx => setParentMenuFunc(ctx, `setParentMenuAfter ${actionCode.get()}`)
  } else if (responder.setMenuAfter) {
    handler.afterFunc = ctx => setMenuFunc(ctx, `setMenuAfter ${actionCode.get()}`)
  }

  if (!responder.action) {
    return createHandlerMiddleware(responder.middleware, handler)
  }

  // When it is hidden the menu should be updated with the current status. Then the user knows why nothing happened.
  handler.runAfterFuncEvenWhenHidden = true

  const childActionCode = actionCode.concat(responder.action)
  handler.only = isCallbackQueryActionFunc(childActionCode, responder.only)

  return createHandlerMiddleware(responder.middleware, handler)
}

export default MenuResponders
module.exports = MenuResponders
