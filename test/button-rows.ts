import test from 'ava'
import Telegraf from 'telegraf'
import {Update} from 'telegram-typings'

import TelegrafInlineMenu from '../source'

import {InlineExtra} from './_telegraf-typing-overrides'

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

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[button1], [button2]])
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('joinLastRow', async t => {
  const menu = new TelegrafInlineMenu('yaay')
    .manual('hit me', 'c')
    .manual('hit me hard', 'd', {joinLastRow: true})

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[button1, button2]])
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('joinLastRow as first button', async t => {
  const menu = new TelegrafInlineMenu('yaay')
    .manual('hit me', 'c', {joinLastRow: true})
    .manual('hit me hard', 'd', {joinLastRow: true})

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[button1, button2]])
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})
