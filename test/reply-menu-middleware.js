import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../inline-menu'

test('middleware works', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('42')
  const bot = new Telegraf()

  bot.on('message', menu.replyMenuMiddleware())

  bot.use(menu.init({actionCode: 'a'}))
  bot.use(ctx => {
    t.log('update missed', ctx.update)
    t.fail('update missed')
  })

  bot.context.editMessageText = () => Promise.resolve(t.fail())

  bot.context.reply = (text, extra) => {
    t.is(text, '42')
    t.deepEqual(extra.reply_markup.inline_keyboard, undefined)
    return Promise.resolve()
  }

  await bot.handleUpdate({message: {text: 'yaay'}})
})

test('works with specific ActionCode', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('foo')
  const submenu = new TelegrafInlineMenu(ctx => `bar ${ctx.match[1]}`)
  menu.select('b', ['y', 'z'], {
    submenu
  })
  const replyMenuMiddleware = submenu.replyMenuMiddleware()

  const bot = new Telegraf()
  bot.on('message', ctx => replyMenuMiddleware.setSpecific(ctx, 'a:b-z'))
  bot.use(menu.init({actionCode: 'a'}))
  bot.context.reply = (text, extra) => {
    t.is(text, 'bar z')
    t.deepEqual(extra.reply_markup.inline_keyboard, undefined)
    return Promise.resolve()
  }

  await bot.handleUpdate({message: {text: '42'}})
})

test('fails with different ActionCode than menu expects', async t => {
  const menu = new TelegrafInlineMenu('foo')
  const submenu = new TelegrafInlineMenu(ctx => `bar ${ctx.match[1]}`)
  menu.select('b', ['y', 'z'], {
    submenu
  })
  const replyMenuMiddleware = submenu.replyMenuMiddleware()

  const bot = new Telegraf()
  bot.on('message', ctx => replyMenuMiddleware.setSpecific(ctx, 'b:c'))
  bot.use(menu.init({actionCode: 'a'}))
  bot.context.reply = (text, extra) => {
    t.is(text, 'bar z')
    t.deepEqual(extra.reply_markup.inline_keyboard, undefined)
    return Promise.resolve()
  }
  bot.catch(error => t.regex(error.message, /actionCode.+b:c/))

  await bot.handleUpdate({message: {text: '42'}})
})

test('fails in dynamic menu without specific ActionCode', async t => {
  const menu = new TelegrafInlineMenu('foo')
  const submenu = new TelegrafInlineMenu('bar')
  menu.select('b', ['y', 'z'], {
    submenu
  })
  const replyMenuMiddleware = submenu.replyMenuMiddleware()

  const bot = new Telegraf()
  bot.on('message', replyMenuMiddleware)
  bot.use(menu.init({actionCode: 'a'}))
  bot.catch(error => {
    t.regex(error.message, /dynamic.+action/)
  })

  await bot.handleUpdate({message: {text: '42'}})
})

test('fails before init', t => {
  const menu = new TelegrafInlineMenu('foo')
  const submenu = new TelegrafInlineMenu('bar')
  menu.select('b', ['y', 'z'], {
    submenu
  })

  const replyMenuMiddleware = submenu.replyMenuMiddleware()
  const handler = replyMenuMiddleware.middleware()
  t.throws(() => {
    handler() // Args (ctx, next) would go normally in here
  }, /menu.init/)
})

test('does not work with menu on multiple positions', t => {
  const menu = new TelegrafInlineMenu('foo')
  const submenu = new TelegrafInlineMenu('bar')

  menu.submenu('x', 'x', submenu)
  menu.submenu('y', 'y', submenu)

  const bot = new Telegraf()
  bot.on('message', submenu.replyMenuMiddleware())

  t.throws(() => {
    bot.use(menu.init({actionCode: 'a'}))
  }, /replyMenuMiddleware does not work on a menu that is reachable on multiple different ways/)
})
