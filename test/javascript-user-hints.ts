import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../source'

// These errors are intended for JavaScript users to hint wrong usage on startup and not on runtime.
// TypeScript types are preventing these.

test('menu.middleware fails with .init() hint', t => {
  const menu: any = new TelegrafInlineMenu('yaay')

  const bot = new Telegraf('')
  // Normally user would use bot.use.
  // But telegraf will later use .middleware() on it. in order to check this faster, trigger this directly
  t.throws(() => bot.use(menu.middleware()), /but\.use\(menu\.init/)
})

// Buttons

test('simpleButton require additionalArgs', t => {
  const menu: any = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.simpleButton('toggle me', 'c')
  }, /Cannot.+undefined/)
})

test('button require additionalArgs', t => {
  const menu: any = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.button('toggle me', 'c')
  }, /Cannot.+undefined/)
})

test('simpleButton require doFunc', t => {
  const menu: any = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.simpleButton('toggle me', 'c', {})
  }, /doFunc/)
})

// Question

test('question require setFunc', t => {
  const menu: any = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.question('Question', 'c', {
      questionText: 'what do you want?'
    })
  }, /setFunc/)
})

test('question require questionText', t => {
  const menu: any = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.question('Question', 'c', {
      setFunc: t.fail
    })
  }, /questionText/)
})

// Select

test('select require additionalArgs', t => {
  const menu: any = new TelegrafInlineMenu('foo')
  t.throws(() => {
    menu.select('c', ['a', 'b'])
  }, /Cannot.+undefined/)
})

test('require setFunc or submenu', t => {
  const menu: any = new TelegrafInlineMenu('foo')
  t.throws(() => {
    menu.select('c', ['a', 'b'], {})
  }, /setFunc.+submenu/)
})

// Toggle

test('toggle require setFunc', t => {
  const menu: any = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.toggle('toggle me', 'c', {
      isSetFunc: t.fail
    })
  }, /setFunc/)
})

test('toggle require isSetFunc', t => {
  const menu: any = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.toggle('toggle me', 'c', {
      setFunc: t.fail
    })
  }, /isSetFunc/)
})
