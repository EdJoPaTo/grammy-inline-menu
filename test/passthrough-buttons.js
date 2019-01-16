import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../inline-menu'

async function macro(t, {
  addButtonFunc,
  expectedKeyboard
}) {
  const menu = new TelegrafInlineMenu('yaay')
  await addButtonFunc(menu)

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve()
  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, expectedKeyboard)
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
}

test('urlButton', macro, {
  addButtonFunc: menu => menu.urlButton('some url', 'https://edjopato.de'),
  expectedKeyboard: [[{
    text: 'some url',
    url: 'https://edjopato.de'
  }]]
})

test('switchToChatButton', macro, {
  addButtonFunc: menu => menu.switchToChatButton('do it', '42'),
  expectedKeyboard: [[{
    text: 'do it',
    switch_inline_query: '42'
  }]]
})

test('switchToCurrentChatButton', macro, {
  addButtonFunc: menu => menu.switchToCurrentChatButton('do it', '42'),
  expectedKeyboard: [[{
    text: 'do it',
    switch_inline_query_current_chat: '42'
  }]]
})
