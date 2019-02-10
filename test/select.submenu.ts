import test from 'ava'
import Telegraf, {ContextMessageUpdate} from 'telegraf'
import {Update} from 'telegram-typings'

import TelegrafInlineMenu from '../source'

import {InlineExtra} from './helpers/telegraf-typing-overrides'

function generateTestBasics(): Telegraf<ContextMessageUpdate> {
  const menu = new TelegrafInlineMenu('foo')

  const submenu = new TelegrafInlineMenu((ctx: any) => ctx.match[1])
    .simpleButton(
      (ctx: any) => `Hit ${ctx.match[1]}!`,
      'd',
      {
        doFunc: (ctx: any) => ctx.answerCbQuery(`${ctx.match[1]} was hit!`)
      }
    )

  menu.select('c', ['a', 'b'], {
    submenu
  })

  const bot = new Telegraf('')
  bot.use(menu.init({
    backButtonText: 'back',
    actionCode: 'a'
  }))

  return bot
}

test('upper menu correct', async t => {
  const bot = generateTestBasics()

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

test('submenu correct', async t => {
  const bot = generateTestBasics()

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra: InlineExtra) => {
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
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a:c-a'}} as Update)
})

test('submenu button works', async t => {
  const bot = generateTestBasics()
  bot.context.editMessageText = () => Promise.reject(new Error('This method should not be called here!'))
  bot.context.answerCbQuery = text => {
    t.is(text, 'a was hit!')
    return Promise.resolve(true)
  }

  bot.use(() => t.fail())

  await bot.handleUpdate({callback_query: {data: 'a:c-a:d'}} as Update)
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
  const bot = new Telegraf('')
  t.throws(() => {
    bot.use(menu.init())
  }, /dynamic.+question.+menu.+a/)
})
