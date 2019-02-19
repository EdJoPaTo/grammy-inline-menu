import test from 'ava'
import ActionCode from './action-code'

import MenuResponders from './menu-responders'

test('no responders', t => {
  const responders = new MenuResponders()
  t.false(responders.hasSomeNonActionResponders())
})

test('only action responder', t => {
  const responders = new MenuResponders()
  responders.add({
    middleware: async () => {},
    action: new ActionCode('main')
  })
  t.false(responders.hasSomeNonActionResponders())
})

test('only non action responder', t => {
  const responders = new MenuResponders()
  responders.add({
    middleware: async () => {}
  })
  t.true(responders.hasSomeNonActionResponders())
})
