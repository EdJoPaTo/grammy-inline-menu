import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../inline-menu'

function generateTestBasics() {
  const menu = new TelegrafInlineMenu('foo')

  const submenu = new TelegrafInlineMenu(ctx => ctx.match[1])
    .simpleButton(
      ctx => `Hit ${ctx.match[1]}!`,
      'd',
      {
        doFunc: ctx => ctx.answerCbQuery(`${ctx.match[1]} was hit!`)
      }
    )

  menu.select('c', ['a', 'b'], {
    submenu
  })

  const bot = new Telegraf()
  bot.use(menu.init({
    backButtonText: 'back',
    actionCode: 'a:b'
  }))

  return bot
}

test('upper menu correct', async t => {
  const bot = generateTestBasics()

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'a',
        callback_data: 'a:b:c-a'
      }, {
        text: 'b',
        callback_data: 'a:b:c-b'
      }
    ]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b'}})
})

test('submenu correct', async t => {
  const bot = generateTestBasics()

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'Hit a!',
        callback_data: 'a:b:c-a:d'
      }
    ], [
      {
        text: 'back',
        callback_data: 'a:b'
      }
    ]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:b:c-a'}})
})

test('submenu button works', async t => {
  const bot = generateTestBasics()
  bot.context.editMessageText = t.fail
  bot.context.answerCbQuery = text => {
    t.is(text, 'a was hit!')
    return Promise.resolve()
  }
  bot.use(t.fail)

  await bot.handleUpdate({callback_query: {data: 'a:b:c-a:d'}})
})
