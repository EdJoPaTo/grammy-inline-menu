import test from 'ava'
import Telegraf from 'telegraf'
import {Update} from 'telegram-typings'

import ActionCode from './action-code'

import {isCallbackQueryActionFunc} from './middleware-helper'

test('correct callbackQuery', async t => {
  const bot = new Telegraf('')
  bot.use(async ctx => {
    const middleware = isCallbackQueryActionFunc(new ActionCode('a:b'))
    t.true(await middleware(ctx))
  })
  await bot.handleUpdate({callback_query: {data: 'a:b'}} as Update)
})

test('wrong callbackQuery', async t => {
  const bot = new Telegraf('')
  bot.use(async ctx => {
    const middleware = isCallbackQueryActionFunc(new ActionCode('a:b'))
    t.false(await middleware(ctx))
  })
  await bot.handleUpdate({callback_query: {data: 'a:c'}} as Update)
})

test('no callbackQuery', async t => {
  const bot = new Telegraf('')
  bot.use(async ctx => {
    const middleware = isCallbackQueryActionFunc(new ActionCode('a:b'))
    t.false(await middleware(ctx))
  })
  await bot.handleUpdate({message: {}} as Update)
})
