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
    actionCode: 'a'
  }))

  return bot
}

test('upper menu correct', async t => {
  const bot = generateTestBasics()

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'a',
        callback_data: 'a:c-a'
      }, {
        text: 'b',
        callback_data: 'a:c-b'
      }
    ]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
})

test('submenu correct', async t => {
  const bot = generateTestBasics()

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'Hit a!',
        callback_data: 'a:c-a:d'
      }
    ], [
      {
        text: 'back',
        callback_data: 'a'
      }
    ]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:c-a'}})
})

test('submenu button works', async t => {
  const bot = generateTestBasics()
  bot.context.editMessageText = t.fail
  bot.context.answerCbQuery = text => {
    t.is(text, 'a was hit!')
    return Promise.resolve()
  }
  bot.use(t.fail)

  await bot.handleUpdate({callback_query: {data: 'a:c-a:d'}})
})

test('hide dynamic submenu does not work', t => {
  const menu = new TelegrafInlineMenu('foo')

  t.throws(() => {
    menu.select('a', ['a', 'b'], {
      hide: () => false,
      submenu: new TelegrafInlineMenu('bar')
    })
  }, /dynamic/)
})

test('something that is not an action in dynamic menu throws error', t => {
  const menu = new TelegrafInlineMenu('foo')
  const submenu = new TelegrafInlineMenu('bar')
    .question('Question', 'q', {
      questionText: '42',
      setFunc: () => {}
    })
  menu.select('a', ['a', 'b'], {
    submenu
  })
  const bot = new Telegraf()
  t.throws(() => {
    bot.use(menu.init())
  }, /dynamic.+question.+menu.+a/)
})
