import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../source'

const menuKeyboard = [[{
  text: 'Submenu',
  callback_data: 'a:c'
}]]

const baseInitOptions = {
  backButtonText: 'back…',
  mainMenuButtonText: 'main…'
}

test('root menu correct', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.submenu('Submenu', 'c', new TelegrafInlineMenu('bar'))

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve()
  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, menuKeyboard)
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
})

test('hidden submenu goes to the parent menu', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.submenu('Submenu', 'c', new TelegrafInlineMenu('bar'), {
    hide: () => true
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve()
  bot.context.editMessageText = (text, extra) => {
    t.is(text, 'foo')
    // As the submenu is hidden there are no buttons
    t.deepEqual(extra.reply_markup.inline_keyboard, [[]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:c'}})
})

test('hidden submenu goes to the parent menu from the sub sub menu call', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.submenu('Submenu', 'c', new TelegrafInlineMenu('bar'), {
    hide: () => true
  })
    .submenu('Subsubmenu', 'd', new TelegrafInlineMenu('42'))

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve()
  bot.context.editMessageText = (text, extra) => {
    t.is(text, 'foo')
    // As the submenu is hidden there are no buttons
    t.deepEqual(extra.reply_markup.inline_keyboard, [[]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:c:d'}})
})

test('hidden submenu before does not cancel not hidden button', async t => {
  t.plan(1)
  const menu = new TelegrafInlineMenu('foo')
  menu.submenu('foo', 'foo', new TelegrafInlineMenu('foo'))
    .submenu('bar', 'bar', new TelegrafInlineMenu('bar'), {
      hide: () => true
    })

  menu.simpleButton('test', 'test', {
    doFunc: () => {
      t.pass()
    }
  })
  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.editMessageText = () => Promise.resolve(t.fail('simpleButton does not update the menu. The hidden submenu had'))

  await bot.handleUpdate({callback_query: {data: 'a:test'}})
})

test('submenu without back button', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.submenu('Submenu', 'c', new TelegrafInlineMenu('bar'))

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve()
  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, undefined)
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:c'}})
})

test('submenu with back button', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.submenu('Submenu', 'c', new TelegrafInlineMenu('bar'))

  const bot = new Telegraf('')
  bot.use(menu.init({backButtonText: baseInitOptions.backButtonText, actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve()
  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[{
      text: 'back…',
      callback_data: 'a'
    }]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a:c'}})
})

test('submenu with main button', async t => {
  const menu = new TelegrafInlineMenu('foo')
  menu.submenu('Submenu', 'c', new TelegrafInlineMenu('bar'))

  const bot = new Telegraf('')
  bot.use(menu.init({...baseInitOptions}))

  bot.context.answerCbQuery = () => Promise.resolve()
  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, [[{
      text: 'main…',
      callback_data: 'main'
    }]])
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'c'}})
})

test('default init is main', async t => {
  t.plan(1)
  const menu = new TelegrafInlineMenu('foo')

  const bot = new Telegraf('')
  bot.use(menu.init({...baseInitOptions}))

  bot.context.answerCbQuery = () => Promise.resolve()
  bot.context.editMessageText = () => Promise.resolve(t.pass())
  await bot.handleUpdate({callback_query: {data: 'main'}})
})

test('setParentMenuAfter', async t => {
  t.plan(5)
  const menu = new TelegrafInlineMenu('foo')
  menu.submenu('submenu', 's', new TelegrafInlineMenu('bar'))
    .simpleButton('button', 'b', {
      setParentMenuAfter: true,
      doFunc: t.pass
    })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))
  bot.context.answerCbQuery = () => Promise.resolve()
  bot.context.editMessageText = (text, extra) => {
    t.is(text, 'foo')
    t.deepEqual(extra.reply_markup.inline_keyboard, [[{
      text: 'submenu',
      callback_data: 'a:s'
    }]])
    return Promise.resolve()
  }

  bot.use(ctx => {
    t.log(ctx.update)
    t.fail('update missed')
  })

  // +2
  await bot.handleUpdate({callback_query: {data: 'a'}})
  // +2
  await bot.handleUpdate({callback_query: {data: 'a:s:b'}})
})

test('setParentMenuAfter when there is no parent fails', t => {
  const menu = new TelegrafInlineMenu('foo')
    .simpleButton('button', 'b', {
      setParentMenuAfter: true,
      doFunc: t.fail
    })

  const bot = new Telegraf('')
  t.throws(() => {
    bot.use(menu.init())
  }, /set parent menu.+main/)
})
