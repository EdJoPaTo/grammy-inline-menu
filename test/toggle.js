import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../source'
import {emojiTrue} from '../source/prefix'

test('menu correct', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.toggle('toggle me', 'c', {
    setFunc: t.fail,
    isSetFunc: () => true
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[{
      text: emojiTrue + ' toggle me',
      callback_data: 'a:c-false'
    }]])
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
})

test('toggles to true', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.toggle('toggle me', 'c', {
    setFunc: (_ctx, newState) => t.true(newState),
    isSetFunc: () => false
  })

  const bot = new Telegraf('')
  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = () => Promise.resolve(true)
  bot.use(menu.init({actionCode: 'a'}))

  await bot.handleUpdate({callback_query: {data: 'a:c-true'}})
})

test('toggles to false', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.toggle('toggle me', 'c', {
    setFunc: (_ctx, newState) => t.false(newState),
    isSetFunc: () => true
  })

  const bot = new Telegraf('')
  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = () => Promise.resolve(true)
  bot.use(menu.init({actionCode: 'a'}))

  await bot.handleUpdate({callback_query: {data: 'a:c-false'}})
})

async function ownPrefixTest(t, currentState, prefix) {
  const menu = new TelegrafInlineMenu('yaay')
  menu.toggle('toggle me', 'c', {
    setFunc: t.fail,
    isSetFunc: () => currentState,
    prefixTrue: '42',
    prefixFalse: '666'
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[{
      text: `${prefix} toggle me`,
      callback_data: `a:c-${!currentState}`
    }]])
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
}

test('own true prefix', ownPrefixTest, true, '42')
test('own false prefix', ownPrefixTest, false, '666')

test('require setFunc', t => {
  const menu = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.toggle('toggle me', 'c', {
      isSetFunc: t.fail
    })
  }, /setFunc/)
})

test('require isSetFunc', t => {
  const menu = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.toggle('toggle me', 'c', {
      setFunc: t.fail
    })
  }, /isSetFunc/)
})
