import test from 'ava'
import Telegraf from 'telegraf'
import {Update} from 'telegram-typings'

import TelegrafInlineMenu from '../source'
import {emojiTrue, emojiFalse} from '../source/prefix'

import {InlineExtra} from './helpers/telegraf-typing-overrides'

test('option array menu', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b'], {
    setFunc: () => t.fail()
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'a',
        callback_data: 'a:c-a'
      }, {
        text: 'b',
        callback_data: 'a:c-b'
      }
    ]])
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('option object menu', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', {a: 'A', b: 'B'}, {
    setFunc: () => t.fail()
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'A',
        callback_data: 'a:c-a'
      }, {
        text: 'B',
        callback_data: 'a:c-b'
      }
    ]])
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('option async array menu', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', () => Promise.resolve(['a', 'b']), {
    setFunc: () => t.fail()
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'a',
        callback_data: 'a:c-a'
      }, {
        text: 'b',
        callback_data: 'a:c-b'
      }
    ]])
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('option array with textFunc', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b'], {
    textFunc: (_ctx, key) => key.toUpperCase(),
    setFunc: () => t.fail()
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'A',
        callback_data: 'a:c-a'
      }, {
        text: 'B',
        callback_data: 'a:c-b'
      }
    ]])
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('selects', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b'], {
    setFunc: (_ctx, selected) => t.is(selected, 'b')
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = async () => {
    t.pass()
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a:c-b'}} as Update)
})

test('selected key has emoji prefix', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b'], {
    setFunc: () => t.fail(),
    isSetFunc: (_ctx, key) => Promise.resolve(key === 'b')
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'a',
        callback_data: 'a:c-a'
      }, {
        text: emojiTrue + ' b',
        callback_data: 'a:c-b'
      }
    ]])
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('multiselect has prefixes', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b'], {
    multiselect: true,
    setFunc: () => t.fail(),
    isSetFunc: (_ctx, key) => Promise.resolve(key === 'b')
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: emojiFalse + ' a',
        callback_data: 'a:c-a'
      }, {
        text: emojiTrue + ' b',
        callback_data: 'a:c-b'
      }
    ]])
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('custom prefix', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b'], {
    setFunc: () => t.fail(),
    prefixFunc: () => Promise.resolve('bar')
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'bar a',
        callback_data: 'a:c-a'
      }, {
        text: 'bar b',
        callback_data: 'a:c-b'
      }
    ]])
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('hides key in keyboard', async t => {
  t.plan(1)
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b'], {
    setFunc: () => t.fail(),
    hide: (_ctx, key) => key === 'a'
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'b',
        callback_data: 'a:c-b'
      }
    ]])
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('hidden key can not be set', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b'], {
    setFunc: () => t.fail(),
    hide: (_ctx, key) => key === 'a'
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = async () => {
    t.pass()
    return true
  }

  bot.use(() => t.pass())

  await bot.handleUpdate({callback_query: {data: 'a:c-a'}} as Update)
})
