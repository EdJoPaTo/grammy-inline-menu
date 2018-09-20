import test from 'ava'

import TelegrafInlineMenu from '../inline-menu'

test('middleware options has to be set', t => {
  const menu = new TelegrafInlineMenu('yaay')
  t.throws(() => menu.middleware('something'), /options/)
})

test('add handler action has to be ActionCode', t => {
  const menu = new TelegrafInlineMenu('yaay')
  t.throws(() => menu.addHandler({action: '42'}), /ActionCode/)
})

test('add button in ownRow', t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.addButton({text: '42'})
  t.deepEqual(menu.buttons, [[{
    text: '42'
  }]])
})

test('add button in lastRow but there is none', t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.addButton({text: '42'}, false)
  t.deepEqual(menu.buttons, [[{
    text: '42'
  }]])
})

test('add button in lastRow', t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.addButton({text: '42'})
  menu.addButton({text: '43'}, false)
  t.deepEqual(menu.buttons, [[{
    text: '42'
  }, {
    text: '43'
  }]])
})
