const fs = require('fs')
const Telegraf = require('telegraf')
const session = require('telegraf/session')

const TelegrafInlineMenu = require('./telegraf-inline-menu')
const {enabledEmoji} = require('./enabled-emoji')

const token = fs.readFileSync('token.txt', 'utf8').trim()
const bot = new Telegraf(token)
bot.use(session())

const mainMenu = new TelegrafInlineMenu('', ctx => `Hey ${ctx.from.first_name}!`, '🔙 zurück…', '🔝 zum Hauptmenü')

const eventMenu = new TelegrafInlineMenu('e', 'Hier gibts Events')
let someValue = false
eventMenu.toggle('t', 'toggle me', () => {
  someValue = !someValue
}, {isSetFunc: () => someValue})

const allEvents = [
  'AA',
  'AD',
  'AF',
  'CE',
  'DT',
  'VS'
]

function selectEvent(ctx, selected) {
  return ctx.answerCbQuery(selected + ' was added')
}

const addMenu = new TelegrafInlineMenu('e:a', 'Welche Events möchtest du hinzufügen?')
function filterText(ctx) {
  let text = '🔎 Filter'
  if (ctx.session.eventfilter !== '.+') {
    text += ': ' + ctx.session.eventfilter
  }
  return text
}
addMenu.question('filter', filterText,
  (ctx, answer) => {
    ctx.session.eventfilter = answer
  }, {
    questionText: 'Wonach möchtest du filtern?'
  }
)

addMenu.toggle('clearfilter', 'Filter aufheben', ctx => {
  ctx.session.eventfilter = '.+'
}, {
  hide: ctx => ctx.session.eventfilter === '.+'
})

addMenu.list('add', () => allEvents, selectEvent, {
  hide: (ctx, selectedEvent) => {
    console.log('addMenu list hide', ctx.session.eventfilter)
    const filter = ctx.session.eventfilter || '.+'
    const regex = new RegExp(filter, 'i')
    return !regex.test(selectedEvent)
  },
  columns: 3
})

eventMenu.submenu('Hinzufügen…', addMenu)

mainMenu.submenu('Events', eventMenu)

const settingsMenu = new TelegrafInlineMenu('s', '*Settings*')

const mensaSettingsMenu = new TelegrafInlineMenu('s:m', '*Mensa Settings*')
let mensaToggle = false
let student = false
mensaSettingsMenu.toggle('t', 'Essen', () => {
  mensaToggle = !mensaToggle
}, {isSetFunc: () => mensaToggle})
mensaSettingsMenu.toggle('student', 'Studentenpreis', () => {
  student = !student
}, {isSetFunc: () => student, hide: () => !mensaToggle})

let price = 'student'
const priceOptions = {
  student: 'Student',
  attendent: 'Angestellt',
  guest: 'Gast'
}

const selectSet = (ctx, key) => {
  console.log('set price', price, key)
  price = key
}
const selectIsSet = (ctx, key) => key === price
const selectHide = () => !mensaToggle

mensaSettingsMenu.select('p', priceOptions, selectSet, {isSetFunc: selectIsSet, hide: selectHide})

const mensaList = ['Berliner Tor', 'Bergedorf', 'Café Berliner Tor', 'Harburg', 'Hafencity', 'Sonstwo']
const mainMensa = mensaList[0]
mensaList.sort()
let currentlySelectedMensen = []
function toggleMensa(ctx, mensa) {
  if (mensa === mainMensa) {
    return ctx.answerCbQuery('Dies ist bereits deine Hauptmensa')
  }
  if (currentlySelectedMensen.indexOf(mensa) >= 0) {
    currentlySelectedMensen = currentlySelectedMensen.filter(o => o !== mensa)
  } else {
    currentlySelectedMensen.push(mensa)
  }
}
function mensaEmoji(ctx, mensa) {
  if (mensa === mainMensa) {
    return '🍽'
  }
  return enabledEmoji(currentlySelectedMensen.indexOf(mensa) >= 0)
}

mensaSettingsMenu.list('l', mensaList, toggleMensa, {prefixFunc: mensaEmoji, hide: selectHide, columns: 2})

function mensaMenuText() {
  return `Mensa (${currentlySelectedMensen.length})`
}

settingsMenu.submenu(mensaMenuText, mensaSettingsMenu)

mainMenu.submenu('Settings', settingsMenu)

bot.use(mainMenu)
bot.start(ctx => mainMenu.replyMenuNow(ctx))

const {Extra, Markup} = Telegraf

bot.command('test', ctx => ctx.reply('test', Extra.markup(
  Markup.inlineKeyboard([
    Markup.callbackButton('Mensa Settings', 's:m')
  ])
)))

bot.action(/.+/, ctx => ctx.reply('action not handled: ' + ctx.match[0]))

bot.use(ctx => ctx.reply('something not handled'))

bot.catch(error => {
  if (error.description === 'Bad Request: message is not modified') {
    console.error('message not modified')
    return
  }
  console.error('telegraf error', error.response, error.on, error)
})

bot.startPolling()
