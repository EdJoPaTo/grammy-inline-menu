import test, {ExecutionContext} from 'ava'
import Telegraf from 'telegraf'
import {Update} from 'telegram-typings'

import TelegrafInlineMenu from '../source'
import {InlineExtra} from './helpers/telegraf-typing-overrides'

async function macro(t: ExecutionContext, addButtonFunc: (menu: TelegrafInlineMenu) => void, expectedKeyboard: any[][]): Promise<void> {
  const menu = new TelegrafInlineMenu('yaay')
  await addButtonFunc(menu)

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, expectedKeyboard)
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
}

test('urlButton', macro,
  (menu: TelegrafInlineMenu) => menu.urlButton('some url', 'https://edjopato.de'),
  [[{
    text: 'some url',
    url: 'https://edjopato.de'
  }]]
)

test('switchToChatButton', macro,
  (menu: TelegrafInlineMenu) => menu.switchToChatButton('do it', '42'),
  [[{
    text: 'do it',
    switch_inline_query: '42'
  }]]
)

test('switchToCurrentChatButton', macro,
  (menu: TelegrafInlineMenu) => menu.switchToCurrentChatButton('do it', '42'),
  [[{
    text: 'do it',
    switch_inline_query_current_chat: '42'
  }]]
)
