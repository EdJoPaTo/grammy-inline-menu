const fs = require('fs')

const Telegraf = require('telegraf')
const session = require('telegraf/session')

const TelegrafInlineMenu = require('./inline-menu')

const menu = new TelegrafInlineMenu('Main Menu')

menu.urlButton('EdJoPaTo.de', 'https://edjopato.de')

let mainMenuToggle = false
menu.toggle('toggle me', 'a', {
  setFunc: (ctx, newVal) => {
    mainMenuToggle = newVal
  },
  isSetFunc: () => mainMenuToggle
})

menu.simpleButton('click me', 'c', {
  doFunc: ctx => ctx.answerCbQuery('you clicked me!'),
  hide: () => mainMenuToggle
})

menu.simpleButton('click me harder', 'd', {
  doFunc: ctx => ctx.answerCbQuery('you can do better!'),
  joinLastRow: true,
  hide: () => mainMenuToggle
})

let selectedKey = 'b'
menu.select('s', ['A', 'B', 'C'], {
  setFunc: (ctx, key) => {
    selectedKey = key
    return ctx.answerCbQuery(`you selected ${key}`)
  },
  isSetFunc: (ctx, key) => key === selectedKey
})

menu.question('Frage', 'f', {
  questionText: 'Was willst du schon immer loswerden?',
  setFunc: (ctx, answer) => ctx.reply(answer),
  hide: () => mainMenuToggle
})

const someMenu = new TelegrafInlineMenu('Other Menu')
someMenu.button('other hit me', 'c', {
  doFunc: ctx => ctx.answerCbQuery('other hit me')
})

someMenu.submenu('Third Menu', 'y', new TelegrafInlineMenu('Third Menu'))
  .setCommand('third')
  .simpleButton('Just a button', 'a', {
    doFunc: ctx => ctx.answerCbQuery('Just a callback query answer')
  })

menu.submenu('Other menu', 'b', someMenu, {
  hide: () => mainMenuToggle
})

menu.setCommand('start')

const token = fs.readFileSync('token.txt', 'utf8').trim()
const bot = new Telegraf(token)
bot.use(session())

bot.use(menu.init({
  backButtonText: 'back…',
  mainMenuButtonText: 'back to main menu…'
}))

bot.catch(error => {
  console.log('telegraf error', error.response, error.parameters, error.on || error)
})

bot.startPolling()
