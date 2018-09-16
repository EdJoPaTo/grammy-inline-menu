import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../inline-menu'

const menuKeyboard = [[{
  text: 'Submenu',
  hide: false,
  callback_data: 'a:b:c'
}]]

const baseInitOptions = {
  backButtonText: 'back…',
  mainMenuButtonText: 'main…'
}

test('root menu correct', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.submenu('Submenu', 'c', new TelegrafInlineMenu('bar'))

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, menuKeyboard)
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b'}})
})

test('no submenu on hide', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.submenu('Submenu', 'c', new TelegrafInlineMenu('bar'), {
    hide: () => true
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = () => Promise.resolve(
    t.fail('so submenu on hide')
  )
  bot.use(t.pass)

  await bot.handleUpdate({callback_query: {data: 'a:b:c'}})
})

test('submenu without back button', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.submenu('Submenu', 'c', new TelegrafInlineMenu('bar'))

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, undefined)
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b:c'}})
})

test('submenu with back button', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.submenu('Submenu', 'c', new TelegrafInlineMenu('bar'))

  const bot = new Telegraf()
  bot.use(menu.init({backButtonText: baseInitOptions.backButtonText, actionCode: 'a:b'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[{
      text: 'back…',
      hide: false,
      callback_data: 'a:b'
    }]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b:c'}})
})

test('submenu with main button', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.submenu('Submenu', 'c', new TelegrafInlineMenu('bar'))

  const bot = new Telegraf()
  bot.use(menu.init({...baseInitOptions}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[{
      text: 'main…',
      hide: false,
      callback_data: 'main'
    }]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'c'}})
})

test('default init is main', async t => {
  t.plan(1)
  const menu = new TelegrafInlineMenu('foo')

  const bot = new Telegraf()
  bot.use(menu.init({...baseInitOptions}))

  bot.context.editMessageText = () => Promise.resolve(t.pass())
  await bot.handleUpdate({callback_query: {data: 'main'}})
})
