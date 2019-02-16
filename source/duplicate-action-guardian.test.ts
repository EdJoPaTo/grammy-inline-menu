import test from 'ava'

import DuplicateActionGuardian from './duplicate-action-guardian'

test('static ActionCode', t => {
  const actionCode = new DuplicateActionGuardian().addStatic('bla')
  t.deepEqual(actionCode.get(), 'bla')
})

test('dynamic ActionCode', t => {
  const actionCode = new DuplicateActionGuardian().addDynamic('bla')
  t.deepEqual(actionCode.get(), /^bla-([^:]+)$/)
})

test('different statics dont fail', t => {
  const g = new DuplicateActionGuardian()
  g.addStatic('a')
  g.addStatic('b')
  t.pass()
})

test('different dynamics dont fail', t => {
  const g = new DuplicateActionGuardian()
  g.addDynamic('a')
  g.addDynamic('b')
  t.pass()
})

test('can not end with -', t => {
  const g = new DuplicateActionGuardian()
  t.throws(() => g.addStatic('a-'), 'action can not end with a -')
  t.throws(() => g.addDynamic('a-'), 'action can not end with a -')
})

test('static already defined', t => {
  const g = new DuplicateActionGuardian()
  g.addStatic('a')
  t.throws(() => g.addStatic('a'), /defined/)
})

test('dynamic already defined', t => {
  const g = new DuplicateActionGuardian()
  g.addDynamic('a')
  t.throws(() => g.addDynamic('a'), /defined/)
})

test('new static could be matched by existing dynamic', t => {
  const g = new DuplicateActionGuardian()
  g.addDynamic('a')
  t.throws(() => g.addStatic('a-b'), /: a$/)
})

test('new dynamic would match existing static', t => {
  const g = new DuplicateActionGuardian()
  g.addStatic('a-b')
  t.throws(() => g.addDynamic('a'), /: a-b$/)
})

test('new dynamic would match existing dynamic', t => {
  const g = new DuplicateActionGuardian()
  g.addDynamic('a-b')
  t.throws(() => g.addDynamic('a'),
    /: a-b$/
  )
})

test('example longer static exists', t => {
  const g = new DuplicateActionGuardian()
  g.addStatic('a-true')
  g.addStatic('a-false')
  g.addStatic('a')
  t.throws(() => g.addDynamic('a'), /: a-true; a-false$/)
})

test('example longer dynamic exists', t => {
  const g = new DuplicateActionGuardian()
  g.addDynamic('a-page')
  t.throws(() => g.addDynamic('a'), /: a-page$/)
})
