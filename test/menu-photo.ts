import test, {ExecutionContext} from 'ava'
import Telegraf from 'telegraf'
import {Update} from 'telegram-typings'

import TelegrafInlineMenu from '../source'
import {emojiTrue} from '../source/prefix'

import {InlineExtra} from './_telegraf-typing-overrides'

function createBasicBot(t: ExecutionContext, menu: TelegrafInlineMenu): any {
  menu.toggle('toggle me', 'c', {
    setFunc: async () => Promise.reject(new Error('Nothing has to be set when only showing the menu')),
    isSetFunc: () => true
  })

  const bot = new Telegraf('')
  bot.use(menu.init({actionCode: 'a'}))
  bot.catch((error: any) => {
    t.log(error)
    t.fail(error.message)
  })

  bot.context.answerCbQuery = async () => true

  return bot
}

const EXPECTED_KEYBOARD = [[{
  text: emojiTrue + ' toggle me',
  callback_data: 'a:c-false'
}]]

const PHOTO_MEDIA = {source: 'cat.png'}

test('menu from callback on photo edits photo', async t => {
  const bot = createBasicBot(t, new TelegrafInlineMenu('yaay', {
    photo: PHOTO_MEDIA
  }))
  const errorMessage = 'only editMessageMedia should be called'
  bot.context.deleteMessage = async () => Promise.reject(new Error(errorMessage))
  bot.context.editMessageText = async () => Promise.reject(new Error(errorMessage))
  bot.context.reply = async () => Promise.reject(new Error(errorMessage))
  bot.context.replyWithPhoto = async () => Promise.reject(new Error(errorMessage))

  bot.context.editMessageMedia = async (media: any, extra: InlineExtra) => {
    t.deepEqual(media, {
      type: 'photo',
      media: PHOTO_MEDIA,
      caption: 'yaay'
    })
    t.deepEqual(extra.reply_markup.inline_keyboard, EXPECTED_KEYBOARD)
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a', message: {photo: [{}, {}]}}} as Update)
})

test('menu from command replies photo', async t => {
  const bot = createBasicBot(t, new TelegrafInlineMenu('yaay', {
    photo: PHOTO_MEDIA
  }).setCommand('test'))
  const errorMessage = 'only replyWithPhoto should be called'
  bot.context.deleteMessage = async () => Promise.reject(new Error(errorMessage))
  bot.context.editMessageMedia = async () => Promise.reject(new Error(errorMessage))
  bot.context.editMessageText = async () => Promise.reject(new Error(errorMessage))
  bot.context.reply = async () => Promise.reject(new Error(errorMessage))

  bot.context.replyWithPhoto = async (photo: any, extra: InlineExtra) => {
    t.is(photo, PHOTO_MEDIA)
    t.is(extra.caption, 'yaay')
    t.deepEqual(extra.reply_markup.inline_keyboard, EXPECTED_KEYBOARD)
    return true
  }

  await bot.handleUpdate({message: {
    text: '/test',
    entities: [{type: 'bot_command', offset: 0, length: 5}]
  }} as Update)
})

test('replace message without photo to add photo to menu', async t => {
  t.plan(4)
  const bot = createBasicBot(t, new TelegrafInlineMenu('yaay', {
    photo: PHOTO_MEDIA
  }))
  const errorMessage = 'replyWithPhoto should be called'
  bot.context.editMessageMedia = async () => Promise.reject(new Error(errorMessage))
  bot.context.editMessageText = async () => Promise.reject(new Error(errorMessage))
  bot.context.reply = async () => Promise.reject(new Error(errorMessage))

  bot.context.deleteMessage = async () => t.pass()
  bot.context.replyWithPhoto = async (photo: any, extra: InlineExtra) => {
    t.deepEqual(photo, PHOTO_MEDIA)
    t.is(extra.caption, 'yaay')
    t.deepEqual(extra.reply_markup.inline_keyboard, EXPECTED_KEYBOARD)
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a'}} as Update)
})

test('replace message with photo to remove photo from menu', async t => {
  t.plan(3)
  const bot = createBasicBot(t, new TelegrafInlineMenu('yaay', {
    photo: undefined
  }))
  const errorMessage = 'reply should be called'
  bot.context.editMessageMedia = async () => Promise.reject(new Error(errorMessage))
  bot.context.editMessageText = async () => Promise.reject(new Error(errorMessage))
  bot.context.reply = async () => Promise.reject(new Error(errorMessage))
  bot.context.replyWithPhoto = async () => Promise.reject(new Error(errorMessage))

  bot.context.deleteMessage = async () => t.pass()
  bot.context.reply = async (text: any, extra: InlineExtra) => {
    t.deepEqual(text, 'yaay')
    t.deepEqual(extra.reply_markup.inline_keyboard, EXPECTED_KEYBOARD)
    return true
  }

  await bot.handleUpdate({callback_query: {data: 'a', message: {photo: []} as any}} as Update)
})
