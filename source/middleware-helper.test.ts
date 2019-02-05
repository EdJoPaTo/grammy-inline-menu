import test, {ExecutionContext} from 'ava'

import {createHandlerMiddleware} from './middleware-helper'

interface Middleware {
  (...args: any[]): any;
}

function create(t: ExecutionContext, plan: number, middleware: Middleware, next: Middleware, options?: any): Promise<void> {
  t.plan(plan)
  const result = createHandlerMiddleware(middleware, options)
  return result(666, next)
}

test('just middleware runs', t => create(t, 1, t.pass, t.fail))

test('hide true passes through', t => create(t, 1, t.fail, t.pass, {
  hide: () => Promise.resolve(true)
}))

test('hide false middleware runs', t => create(t, 1, t.pass, t.fail, {
  hide: () => Promise.resolve(false)
}))

test('hide true hiddenFunc runs', t => create(t, 1, t.fail, t.fail, {
  hiddenFunc: t.pass,
  hide: () => Promise.resolve(true)
}))

test('hide false hiddenFunc does not run', t => create(t, 1, t.pass, t.pass, {
  hiddenFunc: t.fail,
  hide: () => Promise.resolve(false)
}))

test('only true middleware runs', t => create(t, 1, t.pass, t.fail, {
  only: () => Promise.resolve(true)
}))

test('only false passes through', t => create(t, 1, t.fail, t.pass, {
  only: () => Promise.resolve(false)
}))

test('afterfunc runs', t => create(t, 2, t.pass, t.fail, {
  afterFunc: () => Promise.resolve(t.pass())
}))

test('afterfunc does not run when hidden', t => create(t, 1, t.fail, t.pass, {
  hide: () => Promise.resolve(true),
  afterFunc: () => Promise.resolve(t.fail())
}))

test('afterfunc run when hidden', t => create(t, 2, t.fail, t.pass, {
  runAfterFuncEvenWhenHidden: true,
  hide: () => Promise.resolve(true),
  afterFunc: () => Promise.resolve(t.pass())
}))
