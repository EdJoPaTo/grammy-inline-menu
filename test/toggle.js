import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../inline-menu'
import {emojiTrue} from '../prefix'

test('menu correct', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.toggle('toggle me', 'c', {
    setFunc: t.fail,
    isSetFunc: () => true
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[{
      text: emojiTrue + ' toggle me',
      callback_data: 'a:b:c:false'
    }]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b'}})
})

test('toggles', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.toggle('toggle me', 'c', {
    setFunc: (ctx, newState) => t.true(newState),
    isSetFunc: () => false
  })

  const bot = new Telegraf()
  bot.context.editMessageText = () => Promise.resolve()
  bot.use(menu.init({actionCode: 'a:b'}))

  await bot.handleUpdate({callback_query: {data: 'a:b:c:true'}})
})

async function ownPrefixTest(t, currentState, prefix) {
  const menu = new TelegrafInlineMenu('yaay')
  menu.toggle('toggle me', 'c', {
    setFunc: t.fail,
    isSetFunc: () => currentState,
    prefixTrue: '42',
    prefixFalse: '666'
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a:b'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[{
      text: prefix + ' toggle me',
      callback_data: 'a:b:c:' + !currentState
    }]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b'}})
}

test('own true prefix', ownPrefixTest, true, '42')
test('own false prefix', ownPrefixTest, false, '666')
