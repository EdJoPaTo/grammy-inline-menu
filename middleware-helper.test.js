import test from 'ava'

import {createHandlerMiddleware} from './middleware-helper'

function create(t, plan, {m: middleware, n: next}, options) {
  t.plan(plan)
  const result = createHandlerMiddleware(middleware, options, t.log)
  return result(666, next)
}

test('just middleware runs', t => create(t, 1, {m: t.pass, n: t.fail}))

test('hide true passes through', t => create(t, 1, {m: t.fail, n: t.pass}, {
  hide: () => Promise.resolve(true)
}))

test('hide false middleware runs', t => create(t, 1, {m: t.pass, n: t.fail}, {
  hide: () => Promise.resolve(false)
}))

test('only true middleware runs', t => create(t, 1, {m: t.pass, n: t.fail}, {
  only: () => Promise.resolve(true)
}))

test('only false passes through', t => create(t, 1, {m: t.fail, n: t.pass}, {
  only: () => Promise.resolve(false)
}))

test('afterfunc runs', t => create(t, 2, {m: t.pass, n: t.fail}, {
  afterFunc: () => Promise.resolve(t.pass())
}))

test('afterfunc does not run when hidden', t => create(t, 1, {m: t.fail, n: t.pass}, {
  hide: () => Promise.resolve(true),
  afterFunc: () => Promise.resolve(t.fail())
}))

test('afterfunc run when hidden', t => create(t, 2, {m: t.fail, n: t.pass}, {
  runAfterFuncEvenWhenHidden: true,
  hide: () => Promise.resolve(true),
  afterFunc: () => Promise.resolve(t.pass())
}))
