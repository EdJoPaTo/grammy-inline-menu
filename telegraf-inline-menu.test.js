import test from 'ava'

const Telegraf = require('telegraf')

const TelegrafInlineMenu = require('./telegraf-inline-menu')
const {enabledEmoji, enabledEmojiTrue, enabledEmojiFalse} = require('./enabled-emoji')

const {Extra} = Telegraf

test('main menu is the one without prefix', t => {
  const menu = new TelegrafInlineMenu('main', 'Main Menu')
  t.is(menu.prefix, '')
})

test('main menu dynamic text', async t => {
  const textFunc = bla => `Hey ${bla}`
  const menu = new TelegrafInlineMenu('', textFunc)
  const {text} = await menu.generate('42')
  t.is(text, 'Hey 42')
})

function exampleToogleMenu() {
  const menu = new TelegrafInlineMenu('a:b', 'some text')
  const setFunc = ({t}) => t.pass()
  const isSetFunc = () => true

  const optionalArgs = {
    isSetFunc
  }
  menu.toggle('c', 'toggle me', setFunc, optionalArgs)
  return menu
}

test('submenu generate', async t => {
  const submenu = exampleToogleMenu()
  const menu = new TelegrafInlineMenu('a', 'upper menu text', 'back…')
  menu.submenu('open submenu here', submenu)
  const ctx = {t}

  t.deepEqual((await menu.generate(ctx)).extra, new Extra({
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{
        text: 'open submenu here',
        hide: false,
        callback_data: 'a:b'
      }]]
    }
  }))

  t.deepEqual((await submenu.generate(ctx)).extra, new Extra({
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{
          text: enabledEmojiTrue + ' toggle me',
          hide: false,
          callback_data: 'a:b:c'
        }], [{
          text: 'back…',
          hide: false,
          callback_data: 'a'
        }]
      ]
    }
  }))
})

test('submenu toggles', async t => {
  t.plan(4)

  const submenu = exampleToogleMenu()
  const menu = new TelegrafInlineMenu('a', 'upper menu text', 'back…')
  menu.submenu('open submenu here', submenu)

  const bot = new Telegraf()
  bot.context.t = t
  bot.context.editMessageText = () => t.pass()
  bot.context.answerCbQuery = () => {}
  bot.use(menu)
  bot.use(ctx => t.fail('update not handled: ' + JSON.stringify(ctx.update)))

  await bot.handleUpdates([
    {callback_query: {data: 'a'}},
    {callback_query: {data: 'a:b'}}
  ])

  await bot.handleUpdate({callback_query: {data: 'a:b:c'}})
})

test('submenu must be below', t => {
  const menu = new TelegrafInlineMenu('a', 'some text')
  const submenu = new TelegrafInlineMenu('b', 'different text')
  t.throws(() => menu.submenu('Button Text', submenu), /below/)
})

test('submenu must be directly below', t => {
  const menu = new TelegrafInlineMenu('a', 'some text')
  const submenu = new TelegrafInlineMenu('a:b:c', 'different text')
  t.throws(() => menu.submenu('Button Text', submenu), /directly below/)
})

test('toogle generate', async t => {
  const menu = exampleToogleMenu()
  const ctx = {t}

  const {text, extra} = await menu.generate(ctx)
  t.is(text, 'some text')
  t.deepEqual(extra, new Extra({
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{
        text: enabledEmojiTrue + ' toggle me',
        hide: false,
        callback_data: 'a:b:c'
      }]]
    }
  }))
})

test('toogle toggles', async t => {
  t.plan(2)

  const menu = exampleToogleMenu()
  const bot = new Telegraf()
  bot.context.t = t
  bot.context.editMessageText = () => t.pass()
  bot.context.answerCbQuery = () => {}

  bot.use(menu)
  bot.use(ctx => t.fail('update not handled: ' + JSON.stringify(ctx.update)))

  await bot.handleUpdate({callback_query: {data: 'a:b:c'}})
})

function exampleSelectMenu(options, additionalArgs) {
  const menu = new TelegrafInlineMenu('a:b', 'some text')
  let selected = 'peter'
  const isSetFunc = (ctx, key) => key === selected

  const setFunc = ({t}, key) => {
    selected = key
    t.pass()
  }

  const optionalArgs = {
    isSetFunc,
    ...additionalArgs
  }
  menu.select('c', options, setFunc, optionalArgs)
  return menu
}

const listSynchronousOptions = {
  hans: 'Hans',
  peter: 'Peter'
}

const listAsyncOptions = () => ({
  hans: 'Hans',
  peter: 'Peter'
})

test('select generate synchronous', selectGenerate, listSynchronousOptions)
test('select selects synchronous', selectSelect, listSynchronousOptions)

test('select generate async', selectGenerate, listAsyncOptions)
test('select selects async', selectSelect, listAsyncOptions)

async function selectGenerate(t, options) {
  const menu = exampleSelectMenu(options)
  const ctx = {t}

  const {text, extra} = await menu.generate(ctx)
  t.is(text, 'some text')
  t.deepEqual(extra, new Extra({
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{
        text: 'Hans',
        hide: false,
        callback_data: 'a:b:c:hans'
      }, {
        text: enabledEmojiTrue + ' Peter',
        hide: false,
        callback_data: 'a:b:c:peter'
      }]]
    }
  }))
}

async function selectSelect(t, options) {
  t.plan(2 * 2)

  const menu = exampleSelectMenu(options)
  const bot = new Telegraf()
  bot.context.t = t
  bot.context.editMessageText = () => t.pass()
  bot.context.answerCbQuery = () => {}
  bot.use(menu)

  // Already selected -> will not t.pass()
  await bot.handleUpdate({callback_query: {data: 'a:b:c:peter'}})

  bot.use(ctx => t.fail('update not handled: ' + JSON.stringify(ctx.update)))

  await bot.handleUpdate({callback_query: {data: 'a:b:c:hans'}})
  await bot.handleUpdate({callback_query: {data: 'a:b:c:peter'}})
}

test('select with option array', async t => {
  const menu = new TelegrafInlineMenu('a:b', 'some text')
  const options = ['Hans', 'Peter']
  const setFunc = () => {}
  const optionalArgs = {
    isSetFunc: (ctx, key) => key === 'Peter'
  }
  menu.select('c', options, setFunc, optionalArgs)

  const {text, extra} = await menu.generate({})
  t.is(text, 'some text')
  t.deepEqual(extra, new Extra({
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{
        text: 'Hans',
        hide: false,
        callback_data: 'a:b:c:Hans'
      }, {
        text: enabledEmojiTrue + ' Peter',
        hide: false,
        callback_data: 'a:b:c:Peter'
      }]]
    }
  }))
})

test('select column 1 generate', async t => {
  const menu = exampleSelectMenu(listSynchronousOptions, {columns: 1})
  const ctx = {t}

  const {text, extra} = await menu.generate(ctx)
  t.is(text, 'some text')
  t.deepEqual(extra, new Extra({
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{
        text: 'Hans',
        hide: false,
        callback_data: 'a:b:c:hans'
      }], [{
        text: enabledEmojiTrue + ' Peter',
        hide: false,
        callback_data: 'a:b:c:peter'
      }]]
    }
  }))
})

test('select with prefix', async t => {
  const menu = exampleSelectMenu(listSynchronousOptions, {
    prefixFunc: (ctx, key) => enabledEmoji(key === 'peter')
  })
  const ctx = {t}

  const {text, extra} = await menu.generate(ctx)
  t.is(text, 'some text')
  t.deepEqual(extra, new Extra({
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{
        text: enabledEmojiFalse + ' Hans',
        hide: false,
        callback_data: 'a:b:c:hans'
      }, {
        text: enabledEmojiTrue + ' Peter',
        hide: false,
        callback_data: 'a:b:c:peter'
      }]]
    }
  }))
})
