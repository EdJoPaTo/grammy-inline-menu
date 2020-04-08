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
  t.throws(() => bot.use(menu.middleware()), {message: /bot\.use\(menu\.init/})
})

// Buttons

test('simpleButton require additionalArgs', t => {
  const menu: any = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.simpleButton('toggle me', 'c')
  }, {message: /Cannot.+undefined/})
})

test('button require additionalArgs', t => {
  const menu: any = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.button('toggle me', 'c')
  }, {message: /Cannot.+undefined/})
})

test('simpleButton require doFunc', t => {
  const menu: any = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.simpleButton('toggle me', 'c', {})
  }, {message: /doFunc/})
})

// Question

test('question require setFunc', t => {
  const menu: any = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.question('Question', 'c', {
      uniqueIdentifier: '666',
      questionText: 'what do you want?'
    })
  }, {message: /setFunc/})
})

test('question require questionText', t => {
  const menu: any = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.question('Question', 'c', {
      setFunc: t.fail,
      uniqueIdentifier: '666'
    })
  }, {message: /questionText/})
})

test('question require uniqueIdentifier', t => {
  const menu: any = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.question('Question', 'c', {
      setFunc: t.fail,
      questionText: 'what do you want?'
    })
  }, {message: /uniqueIdentifier/})
})

// Select

test('select require additionalArgs', t => {
  const menu: any = new TelegrafInlineMenu('foo')
  t.throws(() => {
    menu.select('c', ['a', 'b'])
  }, {message: /Cannot.+undefined/})
})

test('select option submenu is no more', t => {
  const menu: any = new TelegrafInlineMenu('foo')

  t.throws(() => {
    menu.select('c', ['a', 'b'], {
      submenu: new TelegrafInlineMenu('bar')
    })
  }, {message: /selectSubmenu/})
})

// Toggle

test('toggle require setFunc', t => {
  const menu: any = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.toggle('toggle me', 'c', {
      isSetFunc: t.fail
    })
  }, {message: /setFunc/})
})

test('toggle require isSetFunc', t => {
  const menu: any = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.toggle('toggle me', 'c', {
      setFunc: t.fail
    })
  }, {message: /isSetFunc/})
})
