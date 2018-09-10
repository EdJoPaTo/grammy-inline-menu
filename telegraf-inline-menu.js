const {Composer, Extra, Markup} = require('telegraf')

const {getRowsOfButtons} = require('./align-buttons')
const {buildKeyboard} = require('./build-keyboard')
const {enabledEmoji, enabledEmojiTrue} = require('./enabled-emoji')

class TelegrafInlineMenu {
  constructor(prefix, text, backButtonText, mainMenuButtonText) {
    if (prefix === 'main') {
      prefix = ''
    }

    this.prefix = prefix
    this.mainText = text
    this.backButtonText = backButtonText
    this.mainMenuButtonText = mainMenuButtonText

    this.bot = new Composer()
    this.buttons = []

    const actionCode = this.prefix === '' ? 'main' : this.prefix
    this.bot.action(actionCode, ctx => this.setMenuNow(ctx))
  }

  getNeededLastRowButtons() {
    const lastButtonRow = []

    // When there is a parent…
    // When there is a main menu, display main menu button first, back with depth >= 2
    // When there is no main menu instantly display back button
    if (this.parent && this.parent.prefix !== '') {
      const backButtonText = goUpUntilTrue(this, menu => menu.backButtonText).result
      if (backButtonText) {
        const prefixParts = this.prefix.split(':')
        prefixParts.pop()
        const actionCode = prefixParts.join(':')

        lastButtonRow.push({
          text: backButtonText,
          actionCode
        })
      }
    }

    const mainmenu = goUpUntilTrue(this, menu => menu.prefix === '')
    if (this.parent && mainmenu) {
      const mainMenuButtonText = goUpUntilTrue(this, menu => menu.mainMenuButtonText).result
      if (mainMenuButtonText) {
        lastButtonRow.push({
          text: mainMenuButtonText,
          actionCode: 'main'
        })
      }
    }

    return lastButtonRow
  }

  async generate(ctx) {
    let text = this.mainText
    if (typeof this.mainText === 'function') {
      text = await this.mainText(ctx)
    }

    const buttons = [...this.buttons]
    const lastButtonRow = this.getNeededLastRowButtons()
    if (lastButtonRow.length > 0) {
      buttons.push(lastButtonRow)
    }

    const keyboardMarkup = await buildKeyboard(buttons, ctx)
    const extra = Extra.markdown().markup(keyboardMarkup)
    return {text, extra}
  }

  async replyMenuNow(ctx) {
    const {text, extra} = await this.generate(ctx)
    return ctx.reply(text, extra)
  }

  async setMenuNow(ctx) {
    const {text, extra} = await this.generate(ctx)
    return ctx.editMessageText(text, extra)
  }

  middleware() {
    return this.bot.middleware()
  }

  hideMiddleware(hide, ...fns) {
    // This is the opposite of Composer.optional
    return Composer.branch(hide, Composer.safePassThru(), Composer.compose(fns))
  }

  addButton(button, ownRow = true) {
    if (ownRow) {
      this.buttons.push([
        button
      ])
    } else {
      const lastRow = this.buttons[this.buttons.length - 1]
      lastRow.push(button)
    }
  }

  manual(action, text, {hide, joinLastRow, root} = {}) {
    const actionCode = root ? action : this.prefix + ':' + action
    this.addButton({
      text,
      actionCode,
      hide
    }, !joinLastRow)
  }

  button(action, text, doFunc, {hide, joinLastRow} = {}) {
    if (!hide) {
      hide = () => false
    }

    const actionCode = this.prefix + ':' + action
    this.addButton({
      text,
      actionCode,
      hide
    }, !joinLastRow)

    this.bot.action(actionCode, this.hideMiddleware(hide, async ctx => {
      await doFunc(ctx)
      return this.setMenuNow(ctx)
    }))
  }

  urlButton(text, url, {hide, joinLastRow} = {}) {
    if (!hide) {
      hide = () => false
    }
    this.addButton({
      text,
      url,
      hide
    }, !joinLastRow)
  }

  submenu(text, submenu, {hide, joinLastRow} = {}) {
    if (!hide) {
      hide = () => false
    }

    if (submenu.prefix.indexOf(this.prefix) < 0) {
      throw new Error('submenu is not below this menu')
    }
    if ((this.prefix === '' && submenu.prefix.split(':').length !== 1) ||
        (this.prefix !== '' && this.prefix.split(':').length + 1 !== submenu.prefix.split(':').length)) {
      throw new Error('submenu is not directly below this menu')
    }

    submenu.parent = this

    const actionCode = submenu.prefix
    this.addButton({
      text,
      actionCode,
      hide
    }, !joinLastRow)
    this.bot.use(this.hideMiddleware(hide, submenu))
  }

  toggle(action, text, setFunc, {isSetFunc, hide, joinLastRow} = {}) {
    if (!hide) {
      hide = () => false
    }
    console.assert(isSetFunc, `Use menu.toggle(${action}) with isSetFunc. Not using it is depricated. If you cant provide it use menu.button instead.`, 'menu prefix:', this.prefix, 'toggle text:', text)

    const set = async (ctx, newVal) => {
      await setFunc(ctx, newVal)
      return this.setMenuNow(ctx)
    }

    const actionCodePrefix = this.prefix + ':' + action
    this.bot.action(actionCodePrefix + ':true', this.hideMiddleware(hide, ctx => set(ctx, true)))
    this.bot.action(actionCodePrefix + ':false', this.hideMiddleware(hide, ctx => set(ctx, false)))
    // This will be used when isSetFunc is not available (depricated)
    this.bot.action(actionCodePrefix, this.hideMiddleware(hide, ctx => set(ctx)))

    const textPrefix = isSetFunc ? async ctx => enabledEmoji(await isSetFunc(ctx)) : undefined

    const actionCode = isSetFunc ? async ctx => {
      return (await isSetFunc(ctx)) ? actionCodePrefix + ':false' : actionCodePrefix + ':true'
    } : actionCodePrefix

    this.addButton({
      text,
      textPrefix,
      actionCode,
      hide
    }, !joinLastRow)
  }

  list(action, options, setFunc, optionalArgs = {}) {
    return this.select(action, options, setFunc, optionalArgs)
  }

  select(action, options, setFunc, optionalArgs = {}) {
    if (!optionalArgs.hide) {
      optionalArgs.hide = () => false
    }
    const {isSetFunc, hide} = optionalArgs

    const actionCodePrefix = `${this.prefix}:${action}:`
    const actionCode = new RegExp(`^${actionCodePrefix}(.+)$`)
    this.bot.action(actionCode, async ctx => {
      const key = ctx.match[1]
      if (hide && (await hide(ctx, key))) {
        return ctx.answerCbQuery()
      }
      if (isSetFunc && (await isSetFunc(ctx, key))) {
        // Value is already set. ignore
        return ctx.answerCbQuery()
      }
      await setFunc(ctx, key)
      return this.setMenuNow(ctx)
    })

    if (typeof options === 'function') {
      this.buttons.push(async ctx => {
        const optionsResult = await options(ctx)
        return generateSelectButtons(actionCodePrefix, optionsResult, optionalArgs)
      })
    } else {
      const result = generateSelectButtons(actionCodePrefix, options, optionalArgs)
      result.forEach(o => this.buttons.push(o))
    }
  }

  question(action, buttonText, setFunc, {hide, questionText, joinLastRow} = {}) {
    if (!questionText) {
      questionText = buttonText
    }

    const actionCode = this.prefix + ':' + action

    this.bot.on('message', Composer.optional(ctx => ctx.message && ctx.message.reply_to_message && ctx.message.reply_to_message.text === questionText, async ctx => {
      const answer = ctx.message.text
      await setFunc(ctx, answer)
      return this.replyMenuNow(ctx)
    }))

    this.bot.action(actionCode, this.hideMiddleware(hide, ctx => {
      const extra = Extra.markup(Markup.forceReply())
      return Promise.all([
        ctx.reply(questionText, extra),
        ctx.deleteMessage()
      ])
    }))

    this.addButton({
      text: buttonText,
      actionCode,
      hide
    }, !joinLastRow)
  }
}

function generateSelectButtons(actionCodePrefix, options, {isSetFunc, prefixFunc, hide, columns}) {
  const isArray = Array.isArray(options)
  const keys = isArray ? options : Object.keys(options)
  const buttons = keys.map(key => {
    const actionCode = actionCodePrefix + key
    const text = isArray ? key : options[key]
    let textPrefix
    if (prefixFunc) {
      textPrefix = ctx => {
        return prefixFunc(ctx, key)
      }
    } else if (isSetFunc) {
      textPrefix = async ctx => {
        const result = await isSetFunc(ctx, key)
        return result ? enabledEmojiTrue : ''
      }
    }
    const hideKey = ctx => hide(ctx, key)
    return {
      text,
      textPrefix,
      actionCode,
      hide: hideKey
    }
  })
  return getRowsOfButtons(buttons, columns)
}

function goUpUntilTrue(start, func) {
  const result = func(start)
  if (result) {
    return {result, hit: start}
  }
  if (start.parent) {
    return goUpUntilTrue(start.parent, func)
  }
  return undefined
}

module.exports = TelegrafInlineMenu
