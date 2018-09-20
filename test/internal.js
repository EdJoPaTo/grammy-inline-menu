import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../inline-menu'

test('middleware options has to be set', t => {
  const menu = new TelegrafInlineMenu('yaay')
  t.throws(() => menu.middleware('something'), /options/)
})

test('add handler action has to be ActionCode', t => {
  const menu = new TelegrafInlineMenu('yaay')
  t.throws(() => menu.addHandler({action: '42'}), /ActionCode/)
})

test('add button in ownRow', t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.addButton({text: '42'})
  t.deepEqual(menu.buttons, [[{
    text: '42'
  }]])
})

test('add button in lastRow but there is none', t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.addButton({text: '42'}, false)
  t.deepEqual(menu.buttons, [[{
    text: '42'
  }]])
})

test('add button in lastRow', t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.addButton({text: '42'})
  menu.addButton({text: '43'}, false)
  t.deepEqual(menu.buttons, [[{
    text: '42'
  }, {
    text: '43'
  }]])
})

test.serial('setMenuNow menu is not modified', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.question('Question', 'c', {
    questionText: 'what do you want?',
    setFunc: t.fail
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  const normalErrorFunc = console.error
  const normalWarnFunc = console.warn

  console.error = () => t.fail('should use console.warn')
  console.warn = arg1 => {
    t.regex(arg1, /menu is not modified/)
  }

  bot.context.editMessageText = () => {
    const error = new Error('Bad Request: message is not modified')
    error.description = 'Bad Request: message is not modified'
    return Promise.reject(error)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
  console.warn = normalWarnFunc
  console.error = normalErrorFunc
})

test.serial('setMenuNow other error', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.question('Question', 'c', {
    questionText: 'what do you want?',
    setFunc: t.fail
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  const normalErrorFunc = console.error
  const normalWarnFunc = console.warn

  console.error = t.pass
  console.warn = () => t.fail('other error should use console.error')

  bot.context.editMessageText = () => {
    const error = new Error('something different')
    return Promise.reject(error)
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
  console.warn = normalWarnFunc
  console.error = normalErrorFunc
})
