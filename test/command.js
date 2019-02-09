import test from 'ava'
import Telegraf from 'telegraf'

import ActionCode from '../source/action-code'

import TelegrafInlineMenu from '../source'

function createTestBot(t, command) {
  const menu = new TelegrafInlineMenu('foo')
    .manual('bar', 'c')
  menu.setCommand(command)

  const bot = new Telegraf('')
  bot.context.reply = (text, extra) => {
    t.is(text, 'foo')
    t.deepEqual(extra.reply_markup.inline_keyboard, [[{
      text: 'bar',
      callback_data: 'a:c'
    }]])

    return Promise.resolve(true)
  }

  bot.use(menu.init({actionCode: 'a'}))
  return bot
}

test('one command', async t => {
  t.plan(2)
  const bot = createTestBot(t, 'test')
  bot.command('test', () => t.fail('command not handled'))
  bot.use(ctx => t.fail('update not handled: ' + JSON.stringify(ctx.update)))

  await bot.handleUpdate({message: {
    text: '/test',
    entities: [{type: 'bot_command', offset: 0, length: 5}]
  }})
})

test('multiple commands', async t => {
  t.plan(4)
  const bot = createTestBot(t, ['test1', 'test2'])
  bot.command(() => t.fail('command not handled'))
  bot.use(ctx => t.fail('update not handled: ' + JSON.stringify(ctx.update)))

  await bot.handleUpdate({message: {
    text: '/test1',
    entities: [{type: 'bot_command', offset: 0, length: 6}]
  }})
  await bot.handleUpdate({message: {
    text: '/test2',
    entities: [{type: 'bot_command', offset: 0, length: 6}]
  }})
})

test('command can not be used on dynamic menu', t => {
  const menu = new TelegrafInlineMenu('foo')
    .manual('bar', 'c')
  menu.setCommand('test')

  const bot = new Telegraf('')

  // Never use menu.middleware, use menu.init
  // This is just done for the test as init doesnt allow this in the first place but the actual way is more complex
  t.throws(() => {
    bot.use(menu.middleware(new ActionCode(/.+/), {
      depth: 1,
      log: () => {}
    }))
  }, /command.+menu.+\/\^\.\+\$\/.+test/)
})
