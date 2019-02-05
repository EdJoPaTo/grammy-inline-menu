import test from 'ava'
import Telegraf from 'telegraf'

import ActionCode from './action-code'

import {isCallbackQueryActionFunc} from './middleware-helper'

test('correct callbackQuery', async t => {
  const bot = new Telegraf('')
  bot.use(async ctx => {
    const middleware = isCallbackQueryActionFunc(new ActionCode('a:b'))
    t.true(await middleware(ctx))
  })
  await bot.handleUpdate({callback_query: {data: 'a:b'}})
})

test('wrong callbackQuery', async t => {
  const bot = new Telegraf('')
  bot.use(async ctx => {
    const middleware = isCallbackQueryActionFunc(new ActionCode('a:b'))
    t.false(await middleware(ctx))
  })
  await bot.handleUpdate({callback_query: {data: 'a:c'}})
})

test('no callbackQuery', async t => {
  const bot = new Telegraf('')
  bot.use(async ctx => {
    const middleware = isCallbackQueryActionFunc(new ActionCode('a:b'))
    t.false(await middleware(ctx))
  })
  await bot.handleUpdate({message: {}})
})

test('correct callbackQuery with additional true', async t => {
  const bot = new Telegraf('')
  bot.use(async ctx => {
    const middleware = isCallbackQueryActionFunc(new ActionCode('a:b'), () => true)
    t.true(await middleware(ctx))
  })
  await bot.handleUpdate({callback_query: {data: 'a:b'}})
})

test('correct callbackQuery but additional is false', async t => {
  const bot = new Telegraf('')
  bot.use(async ctx => {
    const middleware = isCallbackQueryActionFunc(new ActionCode('a:b'), () => false)
    t.false(await middleware(ctx))
  })
  await bot.handleUpdate({callback_query: {data: 'a:b'}})
})
