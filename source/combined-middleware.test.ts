import test from 'ava'

import CombinedMiddleware from './combined-middleware'

test('just middleware runs', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(t.pass)
    .middleware()
  await m(666, t.fail)
})

test('hide true passes through', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(t.fail)
    .addHide(() => true)
    .middleware()
  await m(666, t.pass)
})

test('hide false middleware runs', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(t.pass)
    .addHide(() => false)
    .middleware()
  await m(666, t.fail)
})

test('multiple hide passes through', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(t.fail)
    .addHide(() => false)
    .addHide(() => true)
    .middleware()
  await m(666, t.pass)
})

test('hide true hiddenFunc runs', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(t.fail, t.pass)
    .addHide(() => true)
    .middleware()
  await m(666, t.fail)
})

test('hide false hiddenFunc does not run', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(t.pass, t.fail)
    .addHide(() => false)
    .middleware()
  await m(666, t.pass)
})

test('only true middleware runs', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(t.pass)
    .addOnly(() => true)
    .middleware()
  await m(666, t.fail)
})

test('only false passes through', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(t.fail)
    .addOnly(() => false)
    .middleware()
  await m(666, t.pass)
})

test('multiple only passes through', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(t.fail)
    .addOnly(() => false)
    .addOnly(() => true)
    .middleware()
  await m(666, t.pass)
})

test('afterFunc runs', async t => {
  t.plan(2)
  const m = new CombinedMiddleware(t.pass)
    .addAfterFunc(t.pass)
    .middleware()
  await m(666, t.fail)
})

test('afterFunc does not run when hidden', async t => {
  t.plan(1)
  const m = new CombinedMiddleware(t.fail)
    .addHide(() => true)
    .addAfterFunc(t.fail)
    .middleware()
  await m(666, t.pass)
})

test('afterFunc runs when hidden', async t => {
  t.plan(2)
  const m = new CombinedMiddleware(t.fail)
    .addHide(() => true)
    .addAfterFunc(t.pass, true)
    .middleware()
  await m(666, t.pass)
})

test('multiple afterFunc run all', async t => {
  t.plan(3)
  const m = new CombinedMiddleware(t.pass)
    .addAfterFunc(t.pass, true)
    .addAfterFunc(t.pass, false)
    .middleware()
  await m(666, t.fail)
})

test('multiple afterFunc with hiding run each based on hide', async t => {
  t.plan(2)
  const m = new CombinedMiddleware(t.fail)
    .addHide(() => true)
    .addAfterFunc(t.pass, true)
    .addAfterFunc(t.fail, false)
    .middleware()
  await m(666, t.pass)
})
