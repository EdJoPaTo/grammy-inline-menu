import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../inline-menu'

const button1 = {
  text: 'hit me',
  callback_data: 'a:c'
}
const button2 = {
  text: 'hit me hard',
  callback_data: 'a:d'
}

test('just create without flags', async t => {
  const menu = new TelegrafInlineMenu('yaay')
    .manual('hit me', 'c')
    .manual('hit me hard', 'd')

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[button1], [button2]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
})

test('joinLastRow', async t => {
  const menu = new TelegrafInlineMenu('yaay')
    .manual('hit me', 'c')
    .manual('hit me hard', 'd', {joinLastRow: true})

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[button1, button2]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
})

test('joinLastRow as first button', async t => {
  const menu = new TelegrafInlineMenu('yaay')
    .manual('hit me', 'c', {joinLastRow: true})
    .manual('hit me hard', 'd', {joinLastRow: true})

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[button1, button2]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
})

// Following Tests use the internal method addButton

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
