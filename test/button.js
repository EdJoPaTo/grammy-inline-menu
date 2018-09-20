import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../inline-menu'

const menuKeyboard = [[{
  text: 'hit me',
  callback_data: 'a:c'
}]]

test('manual menu correct', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.manual('hit me', 'c')

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, menuKeyboard)
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
})

test('simpleButton works', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.simpleButton('hit me', 'c', {
    doFunc: t.pass
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.editMessageText = t.fail

  await bot.handleUpdate({callback_query: {data: 'a:c'}})
})

test('button updates menu', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('yaay')
  menu.button('hit me', 'c', {
    doFunc: t.pass
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, menuKeyboard)
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:c'}})
})

test('hidden button can not be trigged', async t => {
  t.plan(1)
  const menu = new TelegrafInlineMenu('yaay')
  menu.simpleButton('hit me', 'c', {
    doFunc: t.fail,
    hide: () => {
      t.pass()
      return Promise.resolve(true)
    }
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.editMessageText = t.fail

  await bot.handleUpdate({callback_query: {data: 'a:c'}})
})

test('simpleButton require additionalArgs', t => {
  const menu = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.simpleButton('toggle me', 'c')
  }, /Cannot.+undefined/)
})

test('button require additionalArgs', t => {
  const menu = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.button('toggle me', 'c')
  }, /Cannot.+undefined/)
})

test('require doFunc', t => {
  const menu = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.simpleButton('toggle me', 'c', {})
  }, /doFunc/)
})
