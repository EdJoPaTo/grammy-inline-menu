import test from 'ava'
import Telegraf from 'telegraf'
import {Update} from 'telegram-typings'

import TelegrafInlineMenu from '../source'

import {InlineExtra} from './helpers/telegraf-typing-overrides'

test('creates menu', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.pagination('c', {
    setPage: () => t.fail(),
    getCurrentPage: () => 1,
    getTotalPages: () => 2
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: '1',
        callback_data: 'a:c-1'
      }, {
        text: '▶️ 2',
        callback_data: 'a:c-2'
      }
    ]])
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('no pagination with 1 page', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.pagination('c', {
    setPage: () => t.fail(),
    getCurrentPage: () => 1,
    getTotalPages: () => 1
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [])
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('creates menu with async methods', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.pagination('c', {
    setPage: () => t.fail(),
    getCurrentPage: () => Promise.resolve(1),
    getTotalPages: () => Promise.resolve(2)
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: '1',
        callback_data: 'a:c-1'
      }, {
        text: '▶️ 2',
        callback_data: 'a:c-2'
      }
    ]])
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('sets page', async t => {
  t.plan(1)
  const menu = new TelegrafInlineMenu('foo')
  menu.pagination('c', {
    setPage: (_ctx, page) => Promise.resolve(t.is(page, 2)),
    getCurrentPage: () => 1,
    getTotalPages: () => 2
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = () => Promise.resolve(true)

  await bot.handleUpdate({callback_query: {data: 'a:c-2'}} as Update)
})

test('sets page not outside of range', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('foo')
  menu.pagination('c', {
    setPage: (_ctx, page) => Promise.resolve(t.true(page >= 1 && page <= 2)),
    getCurrentPage: () => 1,
    getTotalPages: () => 2
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = () => Promise.resolve(true)

  await bot.handleUpdate({callback_query: {data: 'a:c-0'}} as Update)
  await bot.handleUpdate({callback_query: {data: 'a:c-3'}} as Update)
})

test('sets page 2 when maxPage is 1.5', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.pagination('c', {
    setPage: (_ctx, page) => Promise.resolve(t.is(page, 2)),
    getCurrentPage: () => 1,
    getTotalPages: () => 1.5 // 3 elements with 2 per page -> 1.5 pages -> ceil 2 pages required
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = () => Promise.resolve(true)

  await bot.handleUpdate({callback_query: {data: 'a:c-2'}} as Update)
})

test('sets page 1 when input is bad', async t => {
  t.plan(1)
  const menu = new TelegrafInlineMenu('foo')
  menu.pagination('c', {
    setPage: (_ctx, page) => Promise.resolve(t.is(page, 1)),
    getCurrentPage: () => NaN,
    getTotalPages: () => NaN
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = () => Promise.resolve(true)

  await bot.handleUpdate({callback_query: {data: 'a:c-5'}} as Update)
})

test('hidden pagination', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.pagination('c', {
    hide: () => true,
    setPage: () => t.fail(),
    getCurrentPage: () => Promise.reject(new Error('dont call getCurrentPage when hidden')),
    getTotalPages: () => Promise.reject(new Error('dont call getTotalPages when hidden'))
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [])
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})
