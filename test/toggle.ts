import test, {ExecutionContext} from 'ava'
import Telegraf from 'telegraf'
import {Update} from 'telegram-typings'

import TelegrafInlineMenu from '../source'
import {emojiTrue} from '../source/prefix'

import {InlineExtra} from './helpers/telegraf-typing-overrides'

test('menu correct', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.toggle('toggle me', 'c', {
    setFunc: () => Promise.reject(new Error('Nothing has to be set when only showing the menu')),
    isSetFunc: () => true
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[{
      text: emojiTrue + ' toggle me',
      callback_data: 'a:c-false'
    }]])
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('hidden', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.toggle('toggle me', 'c', {
    hide: () => true,
    setFunc: () => Promise.reject(new Error('When hidden other funcs shouldn\'t be called.')),
    isSetFunc: () => Promise.reject(new Error('When hidden other funcs shouldn\'t be called.'))
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [])
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('toggles to true', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.toggle('toggle me', 'c', {
    setFunc: (_ctx, newState) => t.true(newState),
    isSetFunc: () => false
  })

  const bot = new Telegraf('')
  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async () => true
  bot.use(menu.init({actionCode: 'a'}))

  await bot.handleUpdate({callback_query: {data: 'a:c-true'}} as Update)
})

test('toggles to false', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.toggle('toggle me', 'c', {
    setFunc: (_ctx, newState) => t.false(newState),
    isSetFunc: () => true
  })

  const bot = new Telegraf('')
  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async () => true
  bot.use(menu.init({actionCode: 'a'}))

  await bot.handleUpdate({callback_query: {data: 'a:c-false'}} as Update)
})

async function ownPrefixTest(t: ExecutionContext, currentState: boolean, prefix: string): Promise<void> {
  const menu = new TelegrafInlineMenu('yaay')
  menu.toggle('toggle me', 'c', {
    setFunc: () => t.fail(),
    isSetFunc: () => currentState,
    prefixTrue: '42',
    prefixFalse: '666'
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[{
      text: `${prefix} toggle me`,
      callback_data: `a:c-${!currentState}`
    }]])
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
}

test('own true prefix', ownPrefixTest, true, '42')
test('own false prefix', ownPrefixTest, false, '666')
