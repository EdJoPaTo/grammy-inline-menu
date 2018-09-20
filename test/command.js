import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../inline-menu'

test('one command', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('foo')
    .manual('bar', 'c')
  menu.setCommand('test')

  const bot = new Telegraf()
  bot.context.reply = (text, extra) => {
    t.is(text, 'foo')
    t.deepEqual(extra.reply_markup.inline_keyboard, [[{
      text: 'bar',
      callback_data: 'a:c'
    }]])

    return Promise.resolve()
  }

  bot.use(menu.init({actionCode: 'a'}))
  bot.command('test', () => t.fail('command not handled'))
  bot.use(ctx => t.fail('update not handled: ' + JSON.stringify(ctx.update)))

  await bot.handleUpdate({message: {
    text: '/test',
    entities: [{type: 'bot_command', offset: 0, length: 5}]
  }})
})
