import test from 'ava'
import Telegraf, {ContextMessageUpdate} from 'telegraf'
import {Update} from 'telegram-typings'

import TelegrafInlineMenu from '../source'

import {InlineExtra} from './_telegraf-typing-overrides'

function generateTestBasics(): Telegraf<ContextMessageUpdate> {
  const menu = new TelegrafInlineMenu('foo')

  const submenu = new TelegrafInlineMenu((ctx: any): string => ctx.match[1])
    .simpleButton(
      (ctx: any) => `Hit ${ctx.match[1]}!`,
      'd',
      {
        doFunc: async (ctx: any) => ctx.answerCbQuery(`${ctx.match[1]} was hit!`)
      }
    )

  menu.selectSubmenu('c', ['a', 'b'], submenu)

  const bot = new Telegraf('')
  bot.use(menu.init({
    backButtonText: 'back',
    actionCode: 'a'
  }))

  return bot
}

test('upper menu correct', async t => {
  const bot = generateTestBasics()

  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'a',
        callback_data: 'a:c-a'
      }, {
        text: 'b',
        callback_data: 'a:c-b'
      }
    ]])
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('submenu correct', async t => {
  const bot = generateTestBasics()

  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async (_text, extra: InlineExtra) => {
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
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a:c-a'}} as Update)
})

test('submenu button works', async t => {
  const bot = generateTestBasics()
  bot.context.editMessageText = async () => Promise.reject(new Error('This method should not be called here!'))
  bot.context.answerCbQuery = async text => {
    t.is(text, 'a was hit!')
    return true
  }

  bot.use(() => t.fail())

  await bot.handleUpdate({callback_query: {data: 'a:c-a:d'}} as Update)
})

test('hide submenu ends up in parent menu', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('foo')
    .manual('foo', 'bar')

  const submenu = new TelegrafInlineMenu((ctx: any): string => ctx.match[1])
    .simpleButton(
      (ctx: any) => `Hit ${ctx.match[1]}!`,
      'd',
      {
        doFunc: async (ctx: any) => ctx.answerCbQuery(`${ctx.match[1]} was hit!`)
      }
    )

  menu.selectSubmenu('c', ['a', 'b'], submenu, {
    hide: () => true
  })

  const bot = new Telegraf('')
  bot.use(menu.init({
    backButtonText: 'back',
    actionCode: 'a'
  }))

  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'foo',
        callback_data: 'a:bar'
      }
    ]])
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a:c-a'}} as Update)
  await bot.handleUpdate({callback_query: {data: 'a:c-a:d'}} as Update)
})

test('something that is not an action in dynamic menu throws error', t => {
  const menu = new TelegrafInlineMenu('foo')
  const submenu = new TelegrafInlineMenu('bar')
    .question('Question', 'q', {
      uniqueIdentifier: '666',
      questionText: '42',
      setFunc: () => {}
    })
  menu.selectSubmenu('a', ['a', 'b'], submenu)
  const bot = new Telegraf('')
  t.throws(() => {
    bot.use(menu.init())
  }, /dynamic.+question.+menu.+a/)
})

test('function as backButtonText is possible', async t => {
  const menu = new TelegrafInlineMenu('foo')
  const submenu = new TelegrafInlineMenu((ctx: any): string => ctx.match[1])

  menu.selectSubmenu('c', ['a', 'b'], submenu)

  const bot = new Telegraf('')
  bot.use(menu.init({
    backButtonText: () => 'back',
    mainMenuButtonText: () => 'main menu',
    actionCode: 'a'
  }))

  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[
      {
        text: 'back',
        callback_data: 'a'
      }
    ]])
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a:c-a'}} as Update)
})
