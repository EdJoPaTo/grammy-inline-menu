import test, {ExecutionContext} from 'ava'
import Telegraf, {ContextMessageUpdate} from 'telegraf'
import {Update} from 'telegram-typings'

import TelegrafInlineMenu from '../source'

import {InlineExtra, DUMMY_MESSAGE} from './_telegraf-typing-overrides'

function createTestBot(t: ExecutionContext, command: string | string[]): Telegraf<ContextMessageUpdate> {
  const menu = new TelegrafInlineMenu('foo')
    .manual('bar', 'c')
  menu.setCommand(command)

  const bot = new Telegraf('')
  bot.context.reply = async (text, extra: InlineExtra) => {
    t.is(text, 'foo')
    t.deepEqual(extra.reply_markup.inline_keyboard, [[{
      text: 'bar',
      callback_data: 'a:c'
    }]])

    return DUMMY_MESSAGE
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
  }} as Update)
})

test('multiple commands', async t => {
  t.plan(4)
  const bot = createTestBot(t, ['test1', 'test2'])
  bot.command(['test1', 'test2'], () => t.fail('command not handled'))
  bot.use(ctx => t.fail('update not handled: ' + JSON.stringify(ctx.update)))

  await bot.handleUpdate({message: {
    text: '/test1',
    entities: [{type: 'bot_command', offset: 0, length: 6}]
  }} as Update)
  await bot.handleUpdate({message: {
    text: '/test2',
    entities: [{type: 'bot_command', offset: 0, length: 6}]
  }} as Update)
})

test('command can not be used on dynamic menu', t => {
  const menu = new TelegrafInlineMenu('foo')
  const submenu = menu.selectSubmenu('bar', [], new TelegrafInlineMenu('bar'))
  submenu.setCommand('test')

  const bot = new Telegraf('')

  t.throws(() => {
    bot.use(menu.init())
  }, {message: /command.+menu.+\/\^bar-.+\$\/.+test/})
})
