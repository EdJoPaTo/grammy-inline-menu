import test from 'ava'

const Telegraf = require('telegraf')

const TelegrafInlineMenu = require('./telegraf-inline-menu')
const {enabledEmojiTrue} = require('./enabled-emoji')

const {Extra} = Telegraf

function exampleToogleMenu(backButtonText) {
  const menu = new TelegrafInlineMenu('a:b', 'some text', backButtonText)
  const isSetFunc = () => true
  const setFunc = ({t}, newState) => t.false(newState)

  const optionalArgs = {
    isSetFunc
  }
  menu.toggle('c', 'toggle me', setFunc, optionalArgs)
  return menu
}

function exampleMainMenuWithDepthTwo() {
  const mainmenu = new TelegrafInlineMenu('', '42', 'back…', 'back to main menu…')
  const submenu = new TelegrafInlineMenu('a', '43')
  const subsubmenu = exampleToogleMenu()
  submenu.submenu('subsubmenu', subsubmenu)
  mainmenu.submenu('submenu', submenu)
  return {mainmenu, submenu, subsubmenu}
}

test('generate', async t => {
  const {mainmenu, submenu, subsubmenu} = exampleMainMenuWithDepthTwo()

  t.deepEqual((await mainmenu.generate({t})).extra, new Extra({
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{
        text: 'submenu',
        hide: false,
        callback_data: 'a'
      }]]
    }
  }))

  t.deepEqual((await submenu.generate({t})).extra, new Extra({
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'subsubmenu',
          hide: false,
          callback_data: 'a:b'
        }], [{
          text: 'back to main menu…',
          hide: false,
          callback_data: 'main'
        }]
      ]
    }
  }))

  t.deepEqual((await subsubmenu.generate({t})).extra, new Extra({
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{
          text: enabledEmojiTrue + ' toggle me',
          hide: false,
          callback_data: 'a:b:c:false'
        }], [{
          text: 'back…',
          hide: false,
          callback_data: 'a'
        }, {
          text: 'back to main menu…',
          hide: false,
          callback_data: 'main'
        }]
      ]
    }
  }))
})

test('toggles', async t => {
  t.plan(5)

  const {mainmenu} = exampleMainMenuWithDepthTwo()

  const bot = new Telegraf()
  bot.context.t = t
  bot.context.editMessageText = () => Promise.resolve(t.pass())
  bot.context.answerCbQuery = () => Promise.resolve()
  bot.use(mainmenu)
  bot.use(ctx => t.fail('update not handled: ' + JSON.stringify(ctx.update)))

  await bot.handleUpdates([
    {callback_query: {data: 'main'}},
    {callback_query: {data: 'a'}},
    {callback_query: {data: 'a:b'}},
    {callback_query: {data: 'a:b:c:false'}}
  ])
})
