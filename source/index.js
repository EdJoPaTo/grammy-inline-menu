const assert = require('assert').strict

const {Composer, Extra, Markup} = require('telegraf')

const ActionCode = require('./action-code')
const {getRowsOfButtons} = require('./align-buttons')
const {buildKeyboard} = require('./build-keyboard')
const {prefixEmoji} = require('./prefix')
const {createHandlerMiddleware, isCallbackQueryActionFunc} = require('./middleware-helper')
const {paginationOptions} = require('./pagination')

class TelegrafInlineMenu {
  constructor(text) {
    this.menuText = text
    this.buttons = []
    this.commands = []
    this.handlers = []
    this.replyMenuMiddlewares = []
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
    assert(!obj.action || (obj.action instanceof ActionCode), 'action has to be an ActionCode')
    this.handlers.push(obj)
  }

  async generate(ctx, actionCode, options) {
    options.log('generate…', actionCode.get())
    const text = typeof this.menuText === 'function' ? (await this.menuText(ctx)) : this.menuText

    let actualActionCode
    if (ctx.callbackQuery && actionCode.isDynamic()) {
      const expectedPartCount = options.depth
      const actualParts = ctx.callbackQuery.data.split(':')
      // Go up to the menu that shall be opened
      while (actualParts.length > expectedPartCount) {
        actualParts.pop()
      }

      const menuAction = actualParts.join(':')
      actualActionCode = new ActionCode(menuAction)
      options.log('generate with actualActionCode', actualActionCode.get(), actionCode.get(), ctx.callbackQuery.data)
    } else {
      actualActionCode = actionCode
    }

    const buttons = [...this.buttons]
    const lastButtonRow = generateBackButtonsAsNeeded(actualActionCode, options)
    if (lastButtonRow.length > 0) {
      buttons.push(lastButtonRow)
    }

    const keyboardMarkup = await buildKeyboard(buttons, actualActionCode, ctx)
    options.log('buttons', keyboardMarkup.inline_keyboard)
    const extra = Extra.markdown().markup(keyboardMarkup)
    return {text, extra}
  }

  async setMenuNow(ctx, actionCode, options) {
    const {text, extra} = await this.generate(ctx, actionCode, options)
    if (ctx.updateType !== 'callback_query') {
      return ctx.reply(text, extra)
    }

    await ctx.answerCbQuery()
    return ctx.editMessageText(text, extra)
      .catch(error => {
        if (error.description === 'Bad Request: message is not modified') {
          // This is kind of ok.
          // Not changed stuff should not be sended but sometimes it happens…
          console.warn('menu is not modified. Think about preventing this. Happened while setting menu', actionCode.get())
        } else {
          console.error('setMenuNow failed', actionCode.get(), error)
        }
      })
  }

  replyMenuMiddleware() {
    const obj = {
      middleware: () => {
        return ctx => obj.setSpecific(ctx)
      }
    }
    obj.setSpecific = (ctx, actionCode) => {
      assert(obj.setMenuFunc, 'This does only work when menu is initialized with bot.use(menu.init())')
      if (actionCode) {
        actionCode = new ActionCode(actionCode)
      }

      return obj.setMenuFunc(ctx, actionCode)
    }

    this.replyMenuMiddlewares.push(obj)
    return obj
  }

  init(options = {}) {
    assert(!options.actionCode || options.actionCode.indexOf(':') < 0, 'ActionCode has to start at the base level (without ":")')
    const actionCode = new ActionCode(options.actionCode || 'main')
    delete options.actionCode
    options.hasMainMenu = actionCode.get() === 'main'
    options.depth = options.hasMainMenu ? 0 : 1
    // Debug
    // options.log = (...args) => console.log(new Date(), ...args)
    options.log = options.log || (() => {})
    options.log('init', options)
    const middleware = this.middleware(actionCode, options)
    options.log('init finished')
    return middleware
  }

  middleware(actionCode, options) {
    assert(actionCode, 'use this menu with .init(): but.use(menu.init(args))')
    // This assert is not needed as this function (should) only be called internally.
    // But as options is only used later the root of the error is not that easy to find without.
    assert(options, 'options has to be set')

    if (actionCode.isDynamic()) {
      assert(this.commands.length === 0, 'commands can not point on dynamic submenus. Happened in menu ' + actionCode.get() + ' with the following commands: ' + this.commands.join(', '))

      const handlerNotActions = this.handlers.filter(o => !o.action)
      assert(handlerNotActions.length === 0, 'a dynamic submenu can only contain buttons. A question for example does not work. Happened in menu ' + actionCode.get())
    }

    options.log('middleware triggered', actionCode.get(), options, this)
    options.log('add action reaction', actionCode.get(), 'setMenu')
    const setMenuFunc = (ctx, reason, actionOverride) => {
      if (actionOverride) {
        ctx.match = actionCode.exec(actionOverride.get())
      }

      options.log('set menu', (actionOverride || actionCode).get(), reason, this)
      return this.setMenuNow(ctx, actionOverride || actionCode, options)
    }

    const functions = []
    functions.push(Composer.action(actionCode.get(), ctx => setMenuFunc(ctx, 'menu action')))
    if (this.commands.length > 0) {
      functions.push(Composer.command(this.commands, ctx => setMenuFunc(ctx, 'command')))
    }

    for (const replyMenuMiddleware of this.replyMenuMiddlewares) {
      assert(!replyMenuMiddleware.setMenuFunc, 'replyMenuMiddleware does not work on a menu that is reachable on multiple different ways. This could be implemented but there wasnt a need for this yet. Open an issue on GitHub.')

      replyMenuMiddleware.setMenuFunc = (ctx, actionOverride) => {
        assert(!actionCode.isDynamic() || actionOverride, 'a dynamic menu can only be set when an actionCode is given')

        if (actionOverride) {
          assert(actionCode.test(actionOverride.get()), 'The actionCode has to belong to the menu. ' + actionOverride.get() + ' does not work with the menu ' + actionCode.get())
        }

        return setMenuFunc(ctx, 'replyMenuMiddleware', actionOverride)
      }
    }

    const subOptions = {
      ...options,
      setParentMenuFunc: setMenuFunc,
      depth: options.depth + 1
    }

    const handlerFuncs = this.handlers
      .map(handler => {
        const middlewareOptions = {}
        middlewareOptions.hide = handler.hide
        middlewareOptions.only = handler.only

        const childActionCode = handler.action && actionCode.concat(handler.action)

        let middleware
        if (handler.action) {
          if (handler.submenu) {
            middlewareOptions.only = ctx => {
              return !ctx.callbackQuery || childActionCode.testIsBelow(ctx.callbackQuery.data)
            }

            middlewareOptions.hiddenFunc = (ctx, next) => {
              if (!ctx.callbackQuery) {
                // Only set menu when a hidden button below was used
                // Without callbackData this can not be determined
                return next(ctx)
              }

              return setMenuFunc(ctx, 'menu is hidden')
            }

            middleware = handler.submenu.middleware(childActionCode, subOptions)
          } else {
            // Run the setMenuFunc even when action is hidden.
            // As the button should be hidden already the user must have an old menu
            // Update the menu to show the user why this will not work
            middlewareOptions.runAfterFuncEvenWhenHidden = true
            middlewareOptions.only = isCallbackQueryActionFunc(childActionCode, handler.only)

            options.log('add action reaction', childActionCode.get(), handler.middleware)
            middleware = handler.middleware
          }
        } else {
          middleware = handler.middleware
        }

        if (handler.setParentMenuAfter || handler.setMenuAfter) {
          const reason = 'after handler ' + (childActionCode || actionCode).get()
          if (handler.setParentMenuAfter) {
            if (!options.setParentMenuFunc) {
              throw new Error('Action will not be able to set parent menu as there is no parent menu: ' + actionCode.get())
            }

            middlewareOptions.afterFunc = ctx => options.setParentMenuFunc(ctx, reason)
          } else {
            middlewareOptions.afterFunc = ctx => setMenuFunc(ctx, reason)
          }
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
    assert(additionalArgs.doFunc, 'doFunc is not set. set it or use menu.manual')

    this.addHandler({
      action: new ActionCode(action),
      hide: additionalArgs.hide,
      middleware: additionalArgs.doFunc,
      setParentMenuAfter: additionalArgs.setParentMenuAfter,
      setMenuAfter: additionalArgs.setMenuAfter
    })
    return this.manual(text, action, additionalArgs)
  }

  button(text, action, additionalArgs) {
    additionalArgs.setMenuAfter = true
    return this.simpleButton(text, action, additionalArgs)
  }

  pagination(action, additionalArgs) {
    const {setPage, getCurrentPage, getTotalPages, hide} = additionalArgs

    const pageFromCtx = async ctx => {
      const number = Number(ctx.match[ctx.match.length - 1])
      const totalPages = await getTotalPages(ctx)
      return Math.max(1, Math.min(totalPages, number)) || 1
    }

    const handler = {
      action: new ActionCode(new RegExp(`${action}-(\\d+)`))
    }

    const hitPageButton = async ctx => setPage(ctx, await pageFromCtx(ctx))
    handler.middleware = hitPageButton

    if (hide) {
      handler.hide = hide
    }

    handler.setParentMenuAfter = additionalArgs.setParentMenuAfter
    handler.setMenuAfter = true

    this.addHandler(handler)

    const createPaginationButtons = async ctx => {
      if (hide && await hide(ctx)) {
        return []
      }

      // Numbers are within
      // currentPage in [1..totalPages]
      const totalPages = await getTotalPages(ctx)
      const currentPage = await getCurrentPage(ctx)
      return paginationOptions(totalPages, currentPage)
    }

    this.buttons.push(async ctx => {
      const buttonOptions = await createPaginationButtons(ctx)
      return generateSelectButtons(action, buttonOptions, additionalArgs)
    })

    return this
  }

  question(text, action, additionalArgs) {
    const {questionText, setFunc, hide} = additionalArgs
    assert(questionText, 'questionText is not set. set it')
    assert(setFunc, 'setFunc is not set. set it')

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
        ctx.answerCbQuery(),
        ctx.deleteMessage()
          .catch(error => {
            if (/can't be deleted/.test(error)) {
              // Looks like message is to old to be deleted
              return
            }

            console.error('deleteMessage on question button failed', error)
          })
      ])
    }

    return this.simpleButton(text, action, {
      ...additionalArgs,
      doFunc: hitQuestionButton
    })
  }

  select(action, options, additionalArgs) {
    const {setFunc, submenu, hide} = additionalArgs
    if (submenu) {
      assert(!setFunc, 'setFunc and submenu can not be set at the same time.')
      // The submenu is a middleware that can do other things than callback_data
      // question is an example: the reply to the text does not indicate the actionCode.
      // Without the exact actionCode its not possible to determine the selected key(s) which is needed for hide(…, key)
      assert(!hide, 'hiding a dynamic submenu is not possible')
    }

    const keyFromCtx = ctx => ctx.match[ctx.match.length - 1]
    const handler = {
      action: new ActionCode(new RegExp(`${action}-([^:]+)`))
    }

    if (additionalArgs.hide) {
      handler.hide = ctx => hide(ctx, keyFromCtx(ctx))
    }

    if (setFunc) {
      const hitSelectButton = ctx => setFunc(ctx, keyFromCtx(ctx))
      handler.middleware = hitSelectButton
      handler.setParentMenuAfter = additionalArgs.setParentMenuAfter
      handler.setMenuAfter = true
    } else if (submenu) {
      handler.submenu = submenu
    } else {
      throw new Error('Neither setFunc or submenu are set. Provide one of them.')
    }

    this.addHandler(handler)

    const optionsBefore = options
    if (typeof options !== 'function') {
      options = () => optionsBefore
    }

    this.buttons.push(async ctx => {
      const optionsResult = await options(ctx)
      return generateSelectButtons(action, optionsResult, additionalArgs)
    })

    return this
  }

  toggle(text, action, additionalArgs) {
    const {setFunc, isSetFunc, hide} = additionalArgs
    assert(setFunc, 'setFunc is not set. set it')
    assert(isSetFunc, 'isSetFunc is not set. set it')

    const textFunc = ctx =>
      prefixEmoji(text, isSetFunc, {
        ...additionalArgs
      }, ctx)

    const actionFunc = async ctx => {
      const currentState = await isSetFunc(ctx)
      return currentState ? action + '-false' : action + '-true'
    }

    const baseHandler = {
      hide,
      setMenuAfter: true
    }

    const toggleTrue = ctx => setFunc(ctx, true)
    const toggleFalse = ctx => setFunc(ctx, false)

    this.addHandler({...baseHandler,
      action: new ActionCode(action + '-true'),
      middleware: toggleTrue
    })

    this.addHandler({...baseHandler,
      action: new ActionCode(action + '-false'),
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

function generateSelectButtons(actionBase, options, {
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
    const action = new ActionCode(actionBase + '-' + key)
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
  if (depth > 1 && backButtonText) {
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
