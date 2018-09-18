const {Composer, Extra, Markup} = require('telegraf')

const ActionCode = require('./action-code')
const {getRowsOfButtons} = require('./align-buttons')
const {buildKeyboard} = require('./build-keyboard')
const {prefixEmoji} = require('./prefix')
const {createHandlerMiddleware} = require('./middleware-helper')

class TelegrafInlineMenu {
  constructor(text) {
    this.menuText = text
    this.buttons = []
    this.commands = []
    this.handlers = []
  }

  setCommand(commands) {
    if (!Array.isArray(commands)) {
      commands = [commands]
    }
    this.commands = this.commands.concat(commands)
    return this
  }

  addButton(button, ownRow = true) {
    if (ownRow || this.buttons.length === 0) {
      this.buttons.push([
        button
      ])
    } else {
      const lastRow = this.buttons[this.buttons.length - 1]
      lastRow.push(button)
    }
  }

  addHandler(obj) {
    if (obj.action && !(obj.action instanceof ActionCode)) {
      throw new TypeError('action has to be an ActionCode')
    }
    this.handlers.push(obj)
  }

  async generate(ctx, actionCode, options) {
    if (!options) {
      throw new Error('options has to be set')
    }
    options.log('generate…', actionCode.get())
    const text = typeof this.menuText === 'function' ? (await this.menuText(ctx)) : this.menuText

    const buttons = [...this.buttons]
    const lastButtonRow = generateBackButtonsAsNeeded(actionCode, options)
    if (lastButtonRow.length > 0) {
      buttons.push(lastButtonRow)
    }

    const keyboardMarkup = await buildKeyboard(buttons, actionCode, ctx)
    options.log('buttons', keyboardMarkup.inline_keyboard)
    const extra = Extra.markdown().markup(keyboardMarkup)
    return {text, extra}
  }

  async setMenuNow(ctx, actionCode, options) {
    const {text, extra} = await this.generate(ctx, actionCode, options)
    if (ctx.updateType !== 'callback_query') {
      return ctx.reply(text, extra)
    }
    return ctx.editMessageText(text, extra)
      .catch(error => {
        if (error.description === 'Bad Request: message is not modified') {
          // This is kind of ok.
          // Not changed stuff should not be sended but sometimes it happens…
          console.warn('menu is not modified. Think about preventing this. Happened while setting menu', actionCode.get())
        } else {
          throw error
        }
      })
  }

  init(options = {}) {
    const actionCode = options.actionCode || 'main'
    delete options.actionCode
    options.depth = 0
    options.hasMainMenu = actionCode === 'main'
    // Debug
    // options.log = (...args) => console.log(new Date(), ...args)
    options.log = options.log || (() => {})
    options.log('init', options)
    const middleware = this.middleware(actionCode, options)
    options.log('init finished')
    return middleware
  }

  middleware(actionCode, options) {
    if (!actionCode) {
      throw new Error('use this menu with .init(): but.use(menu.init(args))')
    }
    if (!options) {
      throw new Error('options has to be set')
    }
    options.log('middleware triggered', actionCode, options, this)
    const currentActionCode = new ActionCode(actionCode)
    options.log('add action reaction', currentActionCode.get(), 'setMenu')
    const setMenuFunc = (ctx, reason) => {
      options.log('set menu', currentActionCode.get(), reason, this)
      return this.setMenuNow(ctx, currentActionCode, options)
    }
    const functions = []
    functions.push(Composer.action(currentActionCode.get(), ctx => setMenuFunc(ctx, 'menu action')))
    if (this.commands) {
      functions.push(Composer.command(this.commands, ctx => setMenuFunc(ctx, 'command')))
    }

    const subOptions = {
      ...options,
      depth: options.depth + 1
    }

    const handlerFuncs = this.handlers
      .map(handler => {
        const middlewareOptions = {}
        middlewareOptions.hide = handler.hide
        middlewareOptions.only = handler.only

        const childActionCode = handler.action && currentActionCode.concat(handler.action)

        let middleware
        if (handler.action) {
          if (handler.submenu) {
            middleware = handler.submenu.middleware(childActionCode.get(), subOptions)
          } else {
            // Run the setMenuFunc even when action is hidden.
            // As the button should be hidden already the user must have an old menu
            // Update the menu to show the user why this will not work
            middlewareOptions.runAfterFuncEvenWhenHidden = true
            middlewareOptions.only = async ctx => {
              if (ctx.updateType !== 'callback_query') {
                return false
              }
              ctx.match = childActionCode.exec(ctx.callbackQuery.data)
              if (!ctx.match) {
                return false
              }
              if (handler.only && !(await handler.only(ctx))) {
                return false
              }
              return true
            }

            options.log('add action reaction', childActionCode.get(), handler.middleware)
            middleware = handler.middleware
          }
        } else {
          middleware = handler.middleware
        }
        if (handler.setMenuAfter) {
          middlewareOptions.afterFunc = ctx => setMenuFunc(ctx, 'after handler ' + (childActionCode || currentActionCode).get())
        }
        return createHandlerMiddleware(middleware, middlewareOptions)
      })
    const handlerFuncsFlattened = [].concat(...handlerFuncs)

    return Composer.compose([
      ...functions,
      ...handlerFuncsFlattened
    ])
  }

  basicButton(text, {
    action,
    hide,
    root,
    switchToChat,
    switchToCurrentChat,
    url,

    joinLastRow
  }) {
    this.addButton({
      action,
      hide,
      root,
      switchToChat,
      switchToCurrentChat,
      url,

      text
    }, !joinLastRow)
    return this
  }

  urlButton(text, url, additionalArgs = {}) {
    return this.basicButton(text, {...additionalArgs, url})
  }

  switchToChatButton(text, value, additionalArgs = {}) {
    return this.basicButton(text, {...additionalArgs, switchToChat: value})
  }

  switchToCurrentChatButton(text, value, additionalArgs = {}) {
    return this.basicButton(text, {...additionalArgs, switchToCurrentChat: value})
  }

  manual(text, action, additionalArgs = {}) {
    return this.basicButton(text, {...additionalArgs, action})
  }

  // This button does not update the menu after being pressed
  simpleButton(text, action, additionalArgs) {
    if (!additionalArgs.doFunc) {
      throw new Error('doFunc is not set. set it or use menu.manual')
    }
    this.addHandler({
      action: new ActionCode(action),
      hide: additionalArgs.hide,
      middleware: additionalArgs.doFunc,
      setMenuAfter: additionalArgs.setMenuAfter
    })
    return this.manual(text, action, additionalArgs)
  }

  button(text, action, additionalArgs) {
    additionalArgs.setMenuAfter = true
    return this.simpleButton(text, action, additionalArgs)
  }

  question(text, action, additionalArgs = {}) {
    const {questionText, setFunc, hide} = additionalArgs
    if (!questionText) {
      throw new Error('questionText is not set. set it')
    }
    if (!setFunc) {
      throw new Error('setFunc is not set. set it')
    }

    const parseQuestionAnswer = async ctx => {
      const answer = ctx.message.text
      await setFunc(ctx, answer)
    }

    this.addHandler({
      hide,
      setMenuAfter: true,
      only: ctx => ctx.message && ctx.message.reply_to_message && ctx.message.reply_to_message.text === questionText,
      middleware: parseQuestionAnswer
    })

    const hitQuestionButton = ctx => {
      const extra = Extra.markup(Markup.forceReply())
      return Promise.all([
        ctx.reply(questionText, extra),
        ctx.deleteMessage()
          .catch(error => {
            if (/can't be deleted/.test(error)) {
              // Looks like message is to old to be deleted
              return
            }
            throw error
          })
      ])
    }
    return this.simpleButton(text, action, {
      ...additionalArgs,
      doFunc: hitQuestionButton
    })
  }

  select(action, options, additionalArgs = {}) {
    if (!additionalArgs.setFunc) {
      throw new Error('setFunc is not set. set it')
    }
    const {setFunc, hide} = additionalArgs

    const actionCodeBase = new ActionCode(action)

    const keyFromCtx = ctx => ctx.match[1]
    const hideSelectAction = hide && (ctx => hide(ctx, keyFromCtx(ctx)))
    const hitSelectButton = ctx => setFunc(ctx, keyFromCtx(ctx))

    this.addHandler({
      action: actionCodeBase.concat(/(.+)/),
      hide: hideSelectAction,
      middleware: hitSelectButton,
      setMenuAfter: true
    })

    if (typeof options === 'function') {
      this.buttons.push(async ctx => {
        const optionsResult = await options(ctx)
        return generateSelectButtons(actionCodeBase, optionsResult, additionalArgs)
      })
    } else {
      const result = generateSelectButtons(actionCodeBase, options, additionalArgs)
      result.forEach(o => this.buttons.push(o))
    }

    return this
  }

  toggle(text, action, additionalArgs) {
    if (!additionalArgs.setFunc) {
      throw new Error('setFunc is not set. set it')
    }
    if (!additionalArgs.isSetFunc) {
      throw new Error('isSetFunc is not set. set it')
    }
    const textFunc = ctx =>
      prefixEmoji(text, additionalArgs.isSetFunc, {
        ...additionalArgs
      }, ctx)

    const actionFunc = async ctx => {
      const currentState = await additionalArgs.isSetFunc(ctx)
      return currentState ? action + ':false' : action + ':true'
    }

    const baseHandler = {
      hide: additionalArgs.hide,
      setMenuAfter: true
    }

    const toggleTrue = ctx => additionalArgs.setFunc(ctx, true)
    const toggleFalse = ctx => additionalArgs.setFunc(ctx, false)

    this.addHandler({...baseHandler,
      action: new ActionCode(action).concat('true'),
      middleware: toggleTrue
    })

    this.addHandler({...baseHandler,
      action: new ActionCode(action).concat('false'),
      middleware: toggleFalse
    })

    return this.manual(textFunc, actionFunc, additionalArgs)
  }

  submenu(text, action, submenu, additionalArgs = {}) {
    this.manual(text, action, additionalArgs)
    this.addHandler({
      action: new ActionCode(action),
      hide: additionalArgs.hide,
      submenu
    })
    return submenu
  }
}

function generateSelectButtons(actionCodeBase, options, {
  columns,
  hide,
  isSetFunc,
  maxRows,
  multiselect,
  prefixFunc
}) {
  const isArray = Array.isArray(options)
  const keys = isArray ? options : Object.keys(options)
  const buttons = keys.map(key => {
    const action = actionCodeBase.concat(key).get()
    const text = isArray ? key : options[key]
    const textFunc = ctx =>
      prefixEmoji(text, prefixFunc || isSetFunc, {
        hideFalseEmoji: !multiselect
      }, ctx, key)
    const hideKey = ctx => hide && hide(ctx, key)
    return {
      text: textFunc,
      action,
      hide: hideKey
    }
  })
  return getRowsOfButtons(buttons, columns, maxRows)
}

function generateBackButtonsAsNeeded(actionCode, {
  depth,
  hasMainMenu,
  backButtonText,
  mainMenuButtonText
}) {
  if (actionCode.get() === 'main' || depth === 0) {
    return []
  }
  const buttons = []
  if (depth >= (hasMainMenu ? 2 : 1) && backButtonText) {
    buttons.push({
      text: backButtonText,
      action: actionCode.parent().get(),
      root: true
    })
  }
  if (depth > 0 && hasMainMenu && mainMenuButtonText) {
    buttons.push({
      text: mainMenuButtonText,
      action: 'main',
      root: true
    })
  }
  return buttons
}

module.exports = TelegrafInlineMenu
