import test from 'ava'
import Telegraf from 'telegraf'
import {Update} from 'telegram-typings'

import TelegrafInlineMenu from '../source'

import {InlineExtra} from './_telegraf-typing-overrides'

test('page 1', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b', 'c'], {
    setFunc: () => t.fail(),
    setPage: () => {},
    getCurrentPage: () => 1,
    columns: 2,
    maxRows: 1
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [
      [
        {
          text: 'a',
          callback_data: 'a:c-a'
        }, {
          text: 'b',
          callback_data: 'a:c-b'
        }
      ], [
        {
          text: '1',
          callback_data: 'a:cPage-1'
        },
        {
          text: '▶️ 2',
          callback_data: 'a:cPage-2'
        }
      ]
    ])
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('page 2', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.select('c', ['a', 'b', 'c'], {
    setFunc: () => t.fail(),
    setPage: () => {},
    getCurrentPage: () => 2,
    columns: 2,
    maxRows: 1
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [
      [
        {
          text: 'c',
          callback_data: 'a:c-c'
        }
      ], [
        {
          text: '1 ◀️',
          callback_data: 'a:cPage-1'
        },
        {
          text: '2',
          callback_data: 'a:cPage-2'
        }
      ]
    ])
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('require setPage and getCurrentPage', t => {
  const menu = new TelegrafInlineMenu('foo')
  t.throws(() => {
    menu.select('c', ['a', 'b'], {
      setFunc: () => {},
      setPage: () => {}
    })
  }, /pagination/)
})
