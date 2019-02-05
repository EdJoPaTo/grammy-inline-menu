import test from 'ava'

import ActionCode from './action-code'

test('constructor', t => {
  t.is(new ActionCode('main').get(), 'main')
  t.is(new ActionCode('').get(), 'main')
  t.is(new ActionCode('a').get(), 'a')
  t.is(new ActionCode('a:b').get(), 'a:b')
})

test('parent', t => {
  t.is(new ActionCode('a:b').parent().get(), 'a')
  t.is(new ActionCode('a:b:c:d').parent().get(), 'a:b:c')
  t.is(new ActionCode('a').parent().get(), 'main')
})

test('concat string with string', t => {
  t.is(new ActionCode('main').concat('a').get(), 'a')
  t.is(new ActionCode('a').concat('b').get(), 'a:b')
  t.is(new ActionCode('a:b:c').concat('d').get(), 'a:b:c:d')
  t.is(new ActionCode('a:b').concat('c:d').get(), 'a:b:c:d')
})

test('concat an ActionCode string', t => {
  t.is(new ActionCode('main').concat(new ActionCode('a')).get(), 'a')
})

test('concat an ActionCode regex', t => {
  t.deepEqual(new ActionCode('b').concat(new ActionCode(/(.+)/)).get(), /^b:(.+)$/)
})

test('regex', t => {
  t.deepEqual(new ActionCode(/(.+)/).get(), /^(.+)$/)
})

test('regex parent', t => {
  t.deepEqual(new ActionCode(/b:(.+)/).parent().get(), /^b$/)
  t.deepEqual(new ActionCode(/b-(.+)/).parent().get(), 'main')
})

test('regex parent with allowed :', t => {
  t.deepEqual(new ActionCode(/b:[^:]+/).parent().get(), /^b$/)
  t.deepEqual(new ActionCode(/b:([^:])/).parent().get(), /^b$/)
  t.deepEqual(new ActionCode(/b:(a[^:])/).parent().get(), /^b$/)
  t.deepEqual(new ActionCode(/b:(a[^:]a)/).parent().get(), /^b$/)
  t.deepEqual(new ActionCode(/b:(a[^a:]a)/).parent().get(), /^b$/)
  t.deepEqual(new ActionCode(/b:(a[^a:a]a)/).parent().get(), /^b$/)
})

test('concat string with regex', t => {
  t.deepEqual(new ActionCode('b').concat(/(.+)/).get(), /^b:(.+)$/)
})

test('concat regex with string', t => {
  t.deepEqual(new ActionCode(/foo/).concat('bar').get(), /^foo:bar$/)
})

test('concat regex with regex', t => {
  t.deepEqual(new ActionCode(/foo/).concat(/bar/).get(), /^foo:bar$/)
})

test('regex fail flags', t => {
  t.throws(() => new ActionCode(/42/g), /flags/)
  t.throws(() => new ActionCode(/42/gi), /flags/)
  t.throws(() => new ActionCode(/42/i), /flags/)
})

test('regex fail anchors', t => {
  t.throws(() => new ActionCode(/^42$/), /anchor/)
  t.throws(() => new ActionCode(/^42/), /anchor/)
  t.throws(() => new ActionCode(/42$/), /anchor/)
})

test('getRegex from regex', t => {
  t.deepEqual(new ActionCode(/b/).getRegex(), /^b$/)
})

test('getRegex from string', t => {
  t.deepEqual(new ActionCode('b').getRegex(), /^b$/)
})

test('regex exec', t => {
  t.deepEqual(new ActionCode('b').exec('c'), null)
  t.truthy(new ActionCode('b').exec('b'))
})

test('regex test', t => {
  t.false(new ActionCode('b').test('c'))
  t.true(new ActionCode('b').test('b'))
})

test('testIsBelow', t => {
  t.true(new ActionCode('a:b').testIsBelow('a:b'))
  t.true(new ActionCode('a:b').testIsBelow('a:b:c'))
  t.false(new ActionCode('a:b').testIsBelow('a:z'))
  t.true(new ActionCode(/a:b-\d+/).testIsBelow('a:b-42'))
})

test('isDynamic', t => {
  t.false(new ActionCode('b').isDynamic())
  t.true(new ActionCode(/(.+)/).isDynamic())

  // This is not dynamic, but its a RegExp.
  // Just assume its dynamic is easier.
  t.true(new ActionCode(/b/).isDynamic())
})
