import test from 'ava'
import Telegraf from 'telegraf'
import {Update} from 'telegram-typings'

import TelegrafInlineMenu from '../source'

test.serial('setMenuNow menu is not modified', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.question('Question', 'c', {
    questionText: 'what do you want?',
    setFunc: () => t.fail()
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  const normalErrorFunc = console.error
  const normalWarnFunc = console.warn

  console.error = (error: any) => {
    t.log('maybe wrong error?', error)
    t.fail('should use console.warn')
  }

  console.warn = (arg1: string) => {
    t.regex(arg1, /menu is not modified/)
  }

  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async () => {
    const error: any = new Error('Bad Request: message is not modified')
    error.description = 'Bad Request: message is not modified'
    throw error
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
  console.warn = normalWarnFunc
  console.error = normalErrorFunc
})

test.serial('setMenuNow other error', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.question('Question', 'c', {
    questionText: 'what do you want?',
    setFunc: () => t.fail()
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))

  const normalErrorFunc = console.error
  const normalWarnFunc = console.warn

  console.error = t.pass
  console.warn = () => t.fail('other error should use console.error')

  bot.context.answerCbQuery = async () => true
  bot.context.editMessageText = async () => {
    throw new Error('something different')
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
  console.warn = normalWarnFunc
  console.error = normalErrorFunc
})
