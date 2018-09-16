import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../inline-menu'

test('simple text without buttons', async t => {
  const menu = new TelegrafInlineMenu('yaay')

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = (text, extra) => {
    t.is(text, 'yaay')
    t.deepEqual(extra.reply_markup, {})
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b'}})
})

test('markdown text', async t => {
  const menu = new TelegrafInlineMenu('yaay')

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = (text, extra) => {
    t.is(text, 'yaay')
    t.is(extra.parse_mode, 'Markdown')
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b'}})
})

test('async text func', async t => {
  const menu = new TelegrafInlineMenu(() => Promise.resolve('yaay'))

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = text => {
    t.is(text, 'yaay')
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b'}})
})

test('menu.middleware fails with .init() hint', t => {
  const menu = new TelegrafInlineMenu('yaay')

  const bot = new Telegraf()
  // Normally user would use bot.use.
  // But telegraf will later use .middleware() on it. in order to check this faster, trigger this directly
  t.throws(() => bot.use(menu.middleware()), /but\.use\(menu\.init/)
})
