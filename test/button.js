import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../source'

const menuKeyboard = [[{
  text: 'hit me',
  callback_data: 'a:c'
}]]

test('manual menu correct', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.manual('hit me', 'c')

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, menuKeyboard)
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
})

test('simpleButton works', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.simpleButton('hit me', 'c', {
    doFunc: t.pass
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  // This could also be argumented to be a pass as the button was pressed.
  // But as there is nothing for the menu to do, the user should send the answer on its own.
  bot.context.answerCbQuery = () => Promise.reject(new Error('This method should not be called here!'))
  bot.context.editMessageText = () => Promise.reject(new Error('This method should not be called here!'))

  await bot.handleUpdate({callback_query: {data: 'a:c'}})
})

test('button updates menu', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('yaay')
  menu.button('hit me', 'c', {
    doFunc: t.pass
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = (_text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, menuKeyboard)
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a:c'}})
})

test('hidden button does not run doFunc', async t => {
  t.plan(1)
  const menu = new TelegrafInlineMenu('yaay')
  menu.simpleButton('hit me', 'c', {
    doFunc: t.fail,
    hide: () => {
      t.pass()
      return Promise.resolve(true)
    }
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.reject(new Error('This method should not be called here!'))
  bot.context.editMessageText = () => Promise.reject(new Error('This method should not be called here!'))

  await bot.handleUpdate({callback_query: {data: 'a:c'}})
})

test('hidden button updates the menu', async t => {
  t.plan(1)
  const menu = new TelegrafInlineMenu('yaay')
  menu.button('hit me', 'c', {
    doFunc: t.fail,
    hide: () => true
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.answerCbQuery = () => Promise.resolve(true)
  bot.context.editMessageText = text => {
    t.is(text, 'yaay')
    return Promise.resolve(true)
  }

  await bot.handleUpdate({callback_query: {data: 'a:c'}})
})
