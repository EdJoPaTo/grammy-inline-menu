import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafInlineMenu from '../inline-menu'

const menuKeyboard = [[{
  text: 'Question',
  callback_data: 'a:c'
}]]

test('menu correct', async t => {
  const menu = new TelegrafInlineMenu('yaay')
  menu.question('Question', 'c', {
    questionText: 'what do you want?',
    setFunc: t.fail
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.editMessageText = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, menuKeyboard)
    return Promise.resolve()
  }

  await bot.handleUpdate({callback_query: {data: 'a'}})
})

test('sends question text', async t => {
  t.plan(3)
  const menu = new TelegrafInlineMenu('yaay')
  menu.question('Question', 'c', {
    questionText: 'what do you want?',
    setFunc: t.fail
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.editMessageText = t.fail
  bot.context.deleteMessage = () => Promise.resolve(t.pass())
  bot.context.reply = (text, extra) => {
    t.is(text, 'what do you want?')
    t.deepEqual(extra.reply_markup, {
      force_reply: true
    })
  }

  await bot.handleUpdate({callback_query: {data: 'a:c'}})
})

test('setFunc on answer', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('yaay')
  menu.question('Question', 'c', {
    questionText: 'what do you want?',
    setFunc: (ctx, answer) => t.is(answer, 'more money')
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.editMessageText = t.fail
  bot.context.reply = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, menuKeyboard)
    return Promise.resolve()
  }
  bot.use(ctx => {
    t.log('update not handled', ctx.update)
    t.fail('something not handled')
  })

  await bot.handleUpdate({message: {
    reply_to_message: {
      text: 'what do you want?'
    },
    text: 'more money'
  }})
})

test('dont setFunc on wrong input text', async t => {
  t.plan(1)
  const menu = new TelegrafInlineMenu('yaay')
  menu.question('Question', 'c', {
    questionText: 'what do you want?',
    setFunc: (ctx, answer) => t.is(answer, 'more money')
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.editMessageText = t.fail
  bot.context.reply = () => Promise.resolve(
    t.fail('dont reply on wrong text')
  )
  bot.use(t.pass)

  await bot.handleUpdate({message: {
    reply_to_message: {
      text: 'what do you do?'
    },
    text: 'more money'
  }})
})

test('dont setFunc on hide', async t => {
  t.plan(1)
  const menu = new TelegrafInlineMenu('yaay')
  menu.question('Question', 'c', {
    questionText: 'what do you want?',
    hide: () => true,
    setFunc: (ctx, answer) => t.is(answer, 'more money')
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.editMessageText = t.fail
  bot.context.reply = () => Promise.resolve(
    t.fail('on hide nothing has to be replied')
  )

  bot.use(t.pass)

  await bot.handleUpdate({message: {
    reply_to_message: {
      text: 'what do you want?'
    },
    text: 'more money'
  }})
})

test('accepts other stuff than text', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('yaay')
  menu.question('Question', 'c', {
    questionText: 'what do you want?',
    setFunc: (ctx, answer) => t.is(answer, undefined)
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.editMessageText = t.fail
  bot.context.reply = (text, extra) => {
    t.deepEqual(extra.reply_markup.inline_keyboard, menuKeyboard)
    return Promise.resolve()
  }
  bot.use(ctx => {
    t.log('update not handled', ctx.update)
    t.fail('something not handled')
  })

  await bot.handleUpdate({message: {
    reply_to_message: {
      text: 'what do you want?'
    },
    photo: {},
    caption: '42'
  }})
})

test('multiple question setFuncs do not interfere', async t => {
  t.plan(2)
  const menu = new TelegrafInlineMenu('yaay')
  menu.question('Question', 'c', {
    questionText: 'what do you want to have?',
    setFunc: (ctx, answer) => t.is(answer, 'more money')
  })
  menu.question('Question', 'd', {
    questionText: 'what do you want to eat?',
    setFunc: (ctx, answer) => t.is(answer, 'less meat')
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.editMessageText = t.fail
  bot.context.reply = () => Promise.resolve()

  bot.use(ctx => {
    t.log('update not handled', ctx.update)
    t.fail('something not handled')
  })

  await bot.handleUpdate({message: {
    reply_to_message: {
      text: 'what do you want to have?'
    },
    text: 'more money'
  }})

  await bot.handleUpdate({message: {
    reply_to_message: {
      text: 'what do you want to eat?'
    },
    text: 'less meat'
  }})
})

test('question button works on old menu', async t => {
  t.plan(3)
  const menu = new TelegrafInlineMenu('yaay')
  menu.question('Question', 'c', {
    questionText: 'what do you want?',
    setFunc: t.fail
  })

  const bot = new Telegraf()
  bot.use(menu.init({actionCode: 'a'}))

  bot.context.editMessageText = t.fail
  bot.context.deleteMessage = () => {
    // Method is triggered but fails as the message is to old
    t.pass()
    return Promise.reject(new Error('Bad Request: message can\'t be deleted'))
  }
  bot.context.reply = (text, extra) => {
    t.is(text, 'what do you want?')
    t.deepEqual(extra.reply_markup, {
      force_reply: true
    })
  }

  await bot.handleUpdate({callback_query: {data: 'a:c'}})
})

test('require setFunc', t => {
  const menu = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.question('Question', 'c', {
      questionText: 'what do you want?'
    })
  }, /setFunc/)
})

test('require questionText', t => {
  const menu = new TelegrafInlineMenu('yaay')

  t.throws(() => {
    menu.question('Question', 'c', {
      setFunc: t.fail
    })
  }, /questionText/)
})
