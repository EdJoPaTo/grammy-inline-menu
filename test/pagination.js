import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../source'

test('creates menu', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.pagination('c', {
    getCurrentPage: () => 1,
    getTotalPages: () => 2
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve()
  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: '1',
        callback_data: 'a:c-1'
      }, {
        text: '▶️ 2',
        callback_data: 'a:c-2'
      }
    ]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
})

test('no pagination with 1 page', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.pagination('c', {
    getCurrentPage: () => 1,
    getTotalPages: () => 1
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve()
  bot.context.editMessageText = (text, extra) => {
    t.falsy(extra.reply_markup.inline_keyboard)
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
})

test('creates menu with async methods', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.pagination('c', {
    getCurrentPage: () => Promise.resolve(1),
    getTotalPages: () => Promise.resolve(2)
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve()
  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: '1',
        callback_data: 'a:c-1'
      }, {
        text: '▶️ 2',
        callback_data: 'a:c-2'
      }
    ]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
})

test('sets page', async t => {
  t.plan(1)
  const menu = new TelegrafInlineMenu('foo')
  menu.pagination('c', {
    setPage: (ctx, page) => Promise.resolve(t.is(page, 2)),
    getCurrentPage: () => 1,
    getTotalPages: () => 2
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve()
  bot.context.editMessageText = () => Promise.resolve()

  await bot.handleUpdate({callback_query: {data: 'a:c-2'}})
})

test('sets page not outside of range', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('foo')
  menu.pagination('c', {
    setPage: (ctx, page) => Promise.resolve(t.true(page >= 1 && page <= 2)),
    getCurrentPage: () => 1,
    getTotalPages: () => 2
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve()
  bot.context.editMessageText = () => Promise.resolve()

  await bot.handleUpdate({callback_query: {data: 'a:c-0'}})
  await bot.handleUpdate({callback_query: {data: 'a:c-3'}})
})

test('sets page 1 when input is bad', async t => {
  t.plan(1)
  const menu = new TelegrafInlineMenu('foo')
  menu.pagination('c', {
    setPage: (ctx, page) => Promise.resolve(t.is(page, 1)),
    getCurrentPage: () => 'foo',
    getTotalPages: () => 'bar'
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve()
  bot.context.editMessageText = () => Promise.resolve()

  await bot.handleUpdate({callback_query: {data: 'a:c-5'}})
})

test('hidden pagination', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.pagination('c', {
    hide: () => true,
    getCurrentPage: () => t.fail('dont call getCurrentPage when hidden'),
    getTotalPages: () => t.fail('dont call getTotalPages when hidden')
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve()
  bot.context.editMessageText = (text, extra) => {
    t.falsy(extra.reply_markup.inline_keyboard)
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
})

test('require additionalArgs', t => {
  const menu = new TelegrafInlineMenu('foo')
  t.throws(() => {
    menu.pagination('c')
  }, /Cannot.+undefined/)
})
