const {Composer, Extra, Markup} = require('telegraf')

const ActionCode = require('./action-code')
const {normalizeOptions} = require('./menu-options')
const {prefixEmoji} = require('./prefix')
const {createHandlerMiddleware} = require('./middleware-helper')

const MenuButtons = require('./menu-buttons')
const MenuResponders = require('./menu-responders')

const {generateSelectButtons} = require('./buttons/select')
const {paginationOptions} = require('./buttons/pagination')

class TelegrafInlineMenu {
  constructor(text) {
    this.menuText = text
    this.buttons = new MenuButtons()
    this.responders = new MenuResponders()
    this.commands = []
    this.submenus = []
    this.replyMenuMiddlewares = []
  }

  setCommand(commands) {
    if (!Array.isArray(commands)) {
      commands = [commands]
    }

    for (const c of commands) {
      this.commands.push(c)
    }

    return this
  }

  async generate(ctx, actionCode, options) {
    options.log('generate…', actionCode.get())
    const text = typeof this.menuText === 'function' ? (await this.menuText(ctx)) : this.menuText

    let actualActionCode
    if (actionCode.isDynamic()) {
      if (!ctx.callbackQuery || !ctx.callbackQuery.data) {
        throw new Error('requires a callbackQuery with data in an dynamic menu')
      }

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

    const keyboardMarkup = await this.buttons.generateKeyboardMarkup(ctx, actualActionCode, options)
    options.log('buttons', keyboardMarkup.inline_keyboard)
    const extra = Extra.markdown().markup(keyboardMarkup)
    return {text, extra}
  }

  async setMenuNow(ctx, actionCode, options) {
    const {text, extra} = await this.generate(ctx, actionCode, options)
    if (ctx.updateType !== 'callback_query') {
      await ctx.reply(text, extra)
      return
    }

    await ctx.answerCbQuery()
    await ctx.editMessageText(text, extra)
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
      if (typeof actionCode === 'string') {
        actionCode = new ActionCode(actionCode)
      }

      return obj.setMenuFunc(ctx, actionCode)
    }

    this.replyMenuMiddlewares.push(obj)
    return obj
  }

  init(userOptions = {}) {
    // Debug
    // userOptions.log = (...args) => console.log(new Date(), ...args)
    const {actionCode, internalOptions} = normalizeOptions(userOptions)
    internalOptions.log('init', internalOptions)
    const middleware = this.middleware(actionCode, internalOptions)
    internalOptions.log('init finished')
    return middleware
  }

  middleware(actionCode, options) {
    assert(actionCode, 'use this menu with .init(): but.use(menu.init(args))')
    // This assert is not needed as this function (should) only be called internally.
    // But as options is only used later the root of the error is not that easy to find without.
    assert(options, 'options has to be set')

    if (actionCode.isDynamic()) {
      assert(this.commands.length === 0, `commands can not point on dynamic submenus. Happened in menu ${actionCode.get()} with the following commands: ${this.commands.join(', ')}`)

      const hasResponderWithoutAction = this.responders.hasSomeNonActionResponders()
      assert(!hasResponderWithoutAction, `a dynamic submenu can only contain buttons. A question for example does not work. Happened in menu ${actionCode.get()}`)
    }

    options.log('middleware triggered', actionCode.get(), options, this)
    options.log('add action reaction', actionCode.get(), 'setMenu')
    const setMenuFunc = (ctx, reason, actionOverride) => {
      if (actionOverride) {
        ctx.match = actionCode.exec(actionOverride.getString())
      }

      options.log('set menu', (actionOverride || actionCode).get(), reason, this)
      return this.setMenuNow(ctx, actionOverride || actionCode, options)
    }

    const functions = []
    if (this.commands.length > 0) {
      functions.push(Composer.command(this.commands, ctx => setMenuFunc(ctx, 'command')))
    }

    for (const replyMenuMiddleware of this.replyMenuMiddlewares) {
      assert(!replyMenuMiddleware.setMenuFunc, 'replyMenuMiddleware does not work on a menu that is reachable on multiple different ways. This could be implemented but there wasnt a need for this yet. Open an issue on GitHub.')

      replyMenuMiddleware.setMenuFunc = (ctx, actionOverride) => {
        assert(!actionCode.isDynamic() || actionOverride, 'a dynamic menu can only be set when an actionCode is given')

        if (actionOverride) {
          assert(actionCode.test(actionOverride.getString()), `The actionCode has to belong to the menu. ${actionOverride.get()} does not work with the menu ${actionCode.get()}`)
        }

        return setMenuFunc(ctx, 'replyMenuMiddleware', actionOverride)
      }
    }

    const subOptions = {
      ...options,
      setParentMenuFunc: setMenuFunc,
      depth: Number(options.depth) + 1
    }

    const handlerFuncs = this.submenus
      .map(({action, submenu, hide}) => {
        const childActionCode = actionCode.concat(action)
        const hiddenFunc = (ctx, next) => {
          if (!ctx.callbackQuery) {
            // Only set menu when a hidden button below was used
            // Without callbackData this can not be determined
            return next(ctx)
          }

          return setMenuFunc(ctx, 'menu is hidden')
        }

        const middleware = submenu.middleware(childActionCode, subOptions)
        return createHandlerMiddleware(middleware, {
          only: ctx => !ctx.callbackQuery || childActionCode.testIsBelow(ctx.callbackQuery.data),
          hide,
          hiddenFunc
        })
      })

    const responderMiddleware = this.responders.createMiddleware({
      actionCode,
      setMenuFunc,
      setParentMenuFunc: options.setParentMenuFunc
    })

    return Composer.compose([
      responderMiddleware,
      ...functions,
      ...handlerFuncs
    ])
  }

  urlButton(text, url, additionalArgs = {}) {
    this.buttons.add({
      text,
      url,
      hide: additionalArgs.hide
    }, !additionalArgs.joinLastRow)
    return this
  }

  switchToChatButton(text, value, additionalArgs = {}) {
    this.buttons.add({
      text,
      switchToChat: value,
      hide: additionalArgs.hide
    }, !additionalArgs.joinLastRow)
    return this
  }

  switchToCurrentChatButton(text, value, additionalArgs = {}) {
    this.buttons.add({
      text,
      switchToCurrentChat: value,
      hide: additionalArgs.hide
    }, !additionalArgs.joinLastRow)
    return this
  }

  manual(text, action, additionalArgs = {}) {
    this.buttons.add({
      text,
      action,
      root: additionalArgs.root,
      hide: additionalArgs.hide
    }, !additionalArgs.joinLastRow)
    return this
  }

  // This button does not update the menu after being pressed
  simpleButton(text, action, additionalArgs) {
    assert(additionalArgs.doFunc, 'doFunc is not set. set it or use menu.manual')

    this.responders.add({
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

    this.responders.add({
      middleware: async ctx => setPage(ctx, await pageFromCtx(ctx)),
      action: new ActionCode(new RegExp(`${action}-(\\d+)`)),
      hide,
      setMenuAfter: true
    })

    const createPaginationButtons = async ctx => {
      if (hide && await hide(ctx)) {
        return {}
      }

      // Numbers are within
      // currentPage in [1..totalPages]
      const totalPages = await getTotalPages(ctx)
      const currentPage = await getCurrentPage(ctx)
      return paginationOptions(totalPages, currentPage)
    }

    this.buttons.addCreator(async ctx => {
      const buttonOptions = await createPaginationButtons(ctx)
      const optionsArr = Object.keys(buttonOptions)
      return generateSelectButtons(action, optionsArr, {
        textFunc: (_ctx, key) => buttonOptions[key]
      })
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

    this.responders.add({
      hide,
      setMenuAfter: true,
      only: ctx => ctx.message && ctx.message.reply_to_message && ctx.message.reply_to_message.text === questionText,
      middleware: parseQuestionAnswer
    })

    const hitQuestionButton = async ctx => {
      const extra = Extra.markup(Markup.forceReply())
      await Promise.all([
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
    const actionCode = new ActionCode(new RegExp(`${action}-([^:]+)`))
    const hideKey = hide ? (ctx => hide(ctx, keyFromCtx(ctx))) : false

    if (setFunc) {
      this.responders.add({
        middleware: ctx => setFunc(ctx, keyFromCtx(ctx)),
        action: actionCode,
        hide: hideKey,
        setParentMenuAfter: additionalArgs.setParentMenuAfter,
        setMenuAfter: true
      })
    } else if (submenu) {
      this.submenus.push({
        submenu,
        action: actionCode,
        hide: hideKey
      })
    } else {
      throw new Error('Neither setFunc or submenu are set. Provide one of them.')
    }

    const optionsFunc = typeof options === 'function' ? options : () => options

    const {textFunc, prefixFunc, isSetFunc, multiselect} = additionalArgs

    this.buttons.addCreator(async ctx => {
      const optionsResult = await optionsFunc(ctx)
      const keys = Array.isArray(optionsResult) ? optionsResult : Object.keys(optionsResult)
      const fallbackKeyTextFunc = Array.isArray(optionsResult) ? ((_ctx, key) => key) : ((_ctx, key) => optionsResult[key])
      const textOnlyFunc = textFunc || fallbackKeyTextFunc
      const keyTextFunc = (...args) => prefixEmoji(textOnlyFunc, prefixFunc || isSetFunc, {
        hideFalseEmoji: !multiselect
      }, ...args)
      return generateSelectButtons(action, keys, {
        textFunc: keyTextFunc,
        ...additionalArgs
      })
    })

    return this
  }

  toggle(text, action, additionalArgs) {
    const {setFunc, isSetFunc, hide} = additionalArgs
    assert(setFunc, 'setFunc is not set. set it')
    assert(isSetFunc, 'isSetFunc is not set. set it')

    const hideFunc = async (ctx, state) => {
      if (hide && await hide(ctx)) {
        return true
      }

      const isSet = await isSetFunc(ctx)
      return isSet === state
    }

    this.manual(ctx => prefixEmoji(text, false, additionalArgs, ctx), `${action}-true`, {
      ...additionalArgs,
      hide: ctx => hideFunc(ctx, true)
    })

    this.manual(ctx => prefixEmoji(text, true, additionalArgs, ctx), `${action}-false`, {
      ...additionalArgs,
      hide: ctx => hideFunc(ctx, false)
    })

    const baseHandler = {
      hide,
      setMenuAfter: true
    }

    this.responders.add({...baseHandler,
      action: new ActionCode(`${action}-true`),
      middleware: ctx => setFunc(ctx, true)
    })

    this.responders.add({...baseHandler,
      action: new ActionCode(`${action}-false`),
      middleware: ctx => setFunc(ctx, false)
    })

    return this
  }

  submenu(text, action, submenu, additionalArgs = {}) {
    this.manual(text, action, additionalArgs)
    this.submenus.push({
      action: new ActionCode(action),
      hide: additionalArgs.hide,
      submenu
    })
    return submenu
  }
}

function assert(value, message) {
  if (value) {
    // Everything is ok
    return
  }

  throw new Error(message)
}

module.exports = TelegrafInlineMenu
