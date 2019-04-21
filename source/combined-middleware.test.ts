import test, {ExecutionContext} from 'ava'

import CombinedMiddleware from './combined-middleware'

function pass(t: ExecutionContext): () => Promise<void> {
  return async () => t.pass()
}

function fail(t: ExecutionContext): () => Promise<void> {
  return async () => t.fail()
}

test('just middleware runs', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(pass(t))
    .middleware()
  await m(666, t.fail)
})

test('hide true passes through', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(fail(t))
    .addHide(() => true)
    .middleware()
  await m(666, t.pass)
})

test('hide false middleware runs', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(pass(t))
    .addHide(() => false)
    .middleware()
  await m(666, t.fail)
})

test('multiple hide passes through', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(fail(t))
    .addHide(() => false)
    .addHide(() => true)
    .middleware()
  await m(666, t.pass)
})

test('hide true hiddenFunc runs', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(fail(t), pass(t))
    .addHide(() => true)
    .middleware()
  await m(666, t.fail)
})

test('hide false hiddenFunc does not run', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(pass(t), fail(t))
    .addHide(() => false)
    .middleware()
  await m(666, t.pass)
})

test('only true middleware runs', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(pass(t))
    .addOnly(() => true)
    .middleware()
  await m(666, t.fail)
})

test('only false passes through', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(fail(t))
    .addOnly(() => false)
    .middleware()
  await m(666, t.pass)
})

test('multiple only passes through', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(fail(t))
    .addOnly(() => false)
    .addOnly(() => true)
    .middleware()
  await m(666, t.pass)
})

test('afterFunc runs', async t => {
  t.plan(2)
  const m = new CombinedMiddleware(pass(t))
    .addAfterFunc(pass(t))
    .middleware()
  await m(666, t.fail)
})

test('afterFunc does not run when hidden', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(fail(t))
    .addHide(() => true)
    .addAfterFunc(fail(t))
    .middleware()
  await m(666, t.pass)
})

test('afterFunc runs when hidden', async t => {
  t.plan(2)
  const m = new CombinedMiddleware(fail(t))
    .addHide(() => true)
    .addAfterFunc(pass(t), true)
    .middleware()
  await m(666, t.pass)
})

test('multiple afterFunc run all', async t => {
  t.plan(3)
  const m = new CombinedMiddleware(pass(t))
    .addAfterFunc(pass(t), true)
    .addAfterFunc(pass(t), false)
    .middleware()
  await m(666, t.fail)
})

test('multiple afterFunc with hiding run each based on hide', async t => {
  t.plan(2)
  const m = new CombinedMiddleware(fail(t))
    .addHide(() => true)
    .addAfterFunc(pass(t), true)
    .addAfterFunc(fail(t), false)
    .middleware()
  await m(666, t.pass)
})
