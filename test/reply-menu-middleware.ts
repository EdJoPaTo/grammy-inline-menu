import test from 'ava'
import Telegraf, {ContextMessageUpdate} from 'telegraf'
import {Update} from 'telegram-typings'

import TelegrafInlineMenu from '../source'

import {InlineExtra, DUMMY_MESSAGE} from './helpers/telegraf-typing-overrides'

test('middleware works', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('42')
  const bot = new Telegraf('')

  bot.on('message', menu.replyMenuMiddleware().middleware())

  bot.use(menu.init({actionCode: 'a'}))
  bot.use(ctx => {
    t.log('update missed', ctx.update)
    t.fail('update missed')
  })

  bot.context.editMessageText = () => Promise.reject(new Error('There shouldn\t be any message edited'))

  bot.context.reply = async (text, extra: InlineExtra) => {
    t.is(text, '42')
    t.deepEqual(extra.reply_markup.inline_keyboard, [])
    return DUMMY_MESSAGE
  }

  await bot.handleUpdate({message: {text: 'yaay'}} as Update)
})

test('correct actionCode in menu buttons', async t => {
  const menu = new TelegrafInlineMenu('42')
    .manual('foo', 'bar')
  const bot = new Telegraf('')

  bot.on('message', menu.replyMenuMiddleware().middleware())

  bot.use(menu.init({actionCode: 'a'}))
  bot.use(ctx => {
    t.log('update missed', ctx.update)
    t.fail('update missed')
  })

  bot.context.editMessageText = () => Promise.reject(new Error('There shouldn\t be any message edited'))

  bot.context.reply = async (_text, extra: InlineExtra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[{
      text: 'foo',
      callback_data: 'a:bar'
    }]])
    return DUMMY_MESSAGE
  }

  await bot.handleUpdate({message: {text: 'yaay'}} as Update)
})

test('works with specific ActionCode', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('foo')
  const submenu = new TelegrafInlineMenu((ctx: any) => `bar ${ctx.match[1]}`)
  menu.selectSubmenu('b', ['y', 'z'], submenu)
  const replyMenuMiddleware = submenu.replyMenuMiddleware()

  const bot = new Telegraf('')
  bot.on('message', ctx => replyMenuMiddleware.setSpecific(ctx, 'a:b-z'))
  bot.use(menu.init({actionCode: 'a'}))
  bot.context.reply = async (text, extra: InlineExtra) => {
    t.is(text, 'bar z')
    t.deepEqual(extra.reply_markup.inline_keyboard, [])
    return DUMMY_MESSAGE
  }

  await bot.handleUpdate({message: {text: '42'}} as Update)
})

test('fails with different ActionCode than menu expects', async t => {
  const menu = new TelegrafInlineMenu('foo')
  const submenu = new TelegrafInlineMenu((ctx: any) => `bar ${ctx.match[1]}`)
  menu.selectSubmenu('b', ['y', 'z'], submenu)
  const replyMenuMiddleware = submenu.replyMenuMiddleware()

  const bot = new Telegraf('')
  bot.on('message', ctx => replyMenuMiddleware.setSpecific(ctx, 'b:c'))
  bot.use(menu.init({actionCode: 'a'}))
  bot.context.reply = async (text, extra: InlineExtra) => {
    t.is(text, 'bar z')
    t.deepEqual(extra.reply_markup.inline_keyboard, [])
    return DUMMY_MESSAGE
  }

  bot.catch((error: any) => t.regex(error.message, /actionCode.+b:c/))

  await bot.handleUpdate({message: {text: '42'}} as Update)
})

test('fails in dynamic menu without specific ActionCode', async t => {
  const menu = new TelegrafInlineMenu('foo')
  const submenu = new TelegrafInlineMenu('bar')
  menu.selectSubmenu('b', ['y', 'z'], submenu)
  const replyMenuMiddleware = submenu.replyMenuMiddleware()

  const bot = new Telegraf('')
  bot.on('message', replyMenuMiddleware.middleware())
  bot.use(menu.init({actionCode: 'a'}))
  bot.catch((error: any) => {
    t.regex(error.message, /dynamic.+action/)
  })

  await bot.handleUpdate({message: {text: '42'}} as Update)
})

test('fails before init', t => {
  const menu = new TelegrafInlineMenu('foo')
  const submenu = new TelegrafInlineMenu('bar')
  menu.selectSubmenu('b', ['y', 'z'], submenu)

  const replyMenuMiddleware = submenu.replyMenuMiddleware()
  const handler = replyMenuMiddleware.middleware()
  t.throws(() => {
    handler({} as ContextMessageUpdate, () => null)
  }, /menu.init/)
})

test('does not work with menu on multiple positions', t => {
  const menu = new TelegrafInlineMenu('foo')
  const submenu = new TelegrafInlineMenu('bar')

  menu.submenu('x', 'x', submenu)
  menu.submenu('y', 'y', submenu)

  const bot = new Telegraf('')
  bot.on('message', submenu.replyMenuMiddleware().middleware())

  t.throws(() => {
    bot.use(menu.init({actionCode: 'a'}))
  }, /replyMenuMiddleware does not work on a menu that is reachable on multiple different ways/)
})
