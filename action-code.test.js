import test from 'ava'

const ActionCode = require('./action-code')

test('constructor', t => {
  t.is(new ActionCode('main').get(), 'main')
  t.is(new ActionCode('').get(), 'main')
  t.is(new ActionCode('a').get(), 'a')
  t.is(new ActionCode('a:b').get(), 'a:b')
})

test('constructor wrongs', t => {
  t.throws(() => new ActionCode())
  t.throws(() => new ActionCode({}))
  t.throws(() => new ActionCode(() => {}))
})

test('constructorThrows empty', constructorThrows, undefined)
test('constructorThrows object', constructorThrows, {})
test('constructorThrows function', constructorThrows, () => {})

function constructorThrows(t, input) {
  t.throws(() => new ActionCode(input), /must be/)
}

test('parent', t => {
  t.is(new ActionCode('a:b').parent().get(), 'a')
  t.is(new ActionCode('a:b:c:d').parent().get(), 'a:b:c')
  t.is(new ActionCode('a').parent().get(), 'main')
})

test('static concat', t => {
  t.is(ActionCode.concat('main', 'a').get(), 'a')
  t.is(ActionCode.concat('a', 'b').get(), 'a:b')
  t.is(ActionCode.concat('a:b:c', 'd').get(), 'a:b:c:d')
  t.is(ActionCode.concat('a:b', 'c:d').get(), 'a:b:c:d')
})

test('concat an ActionCode', t => {
  t.is(ActionCode.concat('main', new ActionCode('a')).get(), 'a')
  t.deepEqual(ActionCode.concat('b', new ActionCode(/(.+)/i)).get(), /^b:(.+)$/i)
})

test('concat two ActionCodes', t => {
  t.is(ActionCode.concat(new ActionCode('main'), new ActionCode('a')).get(), 'a')
})

test('regex', t => {
  t.deepEqual(new ActionCode(/(.+)/).get(), /^(.+)$/)
  t.deepEqual(new ActionCode(/(.+)/i).get(), /^(.+)$/i)
})

test('regex concat', t => {
  t.deepEqual(new ActionCode('b').concat(/(.+)/).get(), /^b:(.+)$/)
  t.deepEqual(new ActionCode('b').concat(/(.+)/i).get(), /^b:(.+)$/i)
})

test('regex fail flags', t => {
  t.throws(() => new ActionCode(/42/g), /flags/)
  t.throws(() => new ActionCode(/42/gi), /flags/)
  t.notThrows(() => new ActionCode(/42/i), /flags/)
})

test('regex fail anchors', t => {
  t.throws(() => new ActionCode(/^42$/), /anchor/)
  t.throws(() => new ActionCode(/^42/), /anchor/)
  t.throws(() => new ActionCode(/42$/), /anchor/)
})

test('getRegex from regex', t => {
  t.deepEqual(new ActionCode(/b/).getRegex(), /^b$/)
})

test('getRegex from non regex', t => {
  t.deepEqual(new ActionCode('b').getRegex(), /^b$/)
})

test('exec', t => {
  t.deepEqual(new ActionCode('b').exec('c'), null)
  t.truthy(new ActionCode('b').exec('b'))
})

test('test', t => {
  t.false(new ActionCode('b').test('c'))
  t.true(new ActionCode('b').test('b'))
})
