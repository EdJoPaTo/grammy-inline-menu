import {Composer, Extra, Markup, ContextMessageUpdate} from 'telegraf'

import {ConstOrContextFunc, ContextFunc, ContextNextFunc, ContextKeyFunc} from './generic-types'
import {normalizeOptions, InternalMenuOptions, MenuOptions} from './menu-options'
import {prefixEmoji, PrefixOptions} from './prefix'
import ActionCode from './action-code'
import CombinedMiddleware from './combined-middleware'
import DuplicateActionGuardian from './duplicate-action-guardian'
import MenuButtons from './menu-buttons'
import MenuResponders from './menu-responders'

import {generateSelectButtons, selectButtonCreator, selectHideFunc, SelectButtonCreatorOptions, SelectOptions} from './buttons/select'
import {maximumButtonsPerPage} from './buttons/align'
import {paginationOptions} from './buttons/pagination'

type Photo = string | {source: Buffer | string}

interface MenuAdditionals {
  photo?: ConstOrContextFunc<Photo | undefined>;
}

interface SubmenuEntry {
  action: ActionCode;
  submenu: TelegrafInlineMenu;
  hide?: ContextFunc<boolean>;
}

interface ReplyMenuMiddleware {
  middleware: () => ContextNextFunc;
  setSpecific: (ctx: ContextMessageUpdate, actionCodeOverride: string) => Promise<void>;
  setMenuFunc?: (ctx: ContextMessageUpdate, actionCodeOverride?: string) => Promise<void>;
}

interface ButtonOptions {
  hide?: ContextFunc<boolean>;
  joinLastRow?: boolean;
}

interface ActionButtonOptions extends ButtonOptions {
  root?: boolean;
}

interface SimpleButtonOptions extends ActionButtonOptions {
  doFunc: ContextFunc<any>;
  setMenuAfter?: boolean;
  setParentMenuAfter?: boolean;
}

interface PaginationOptions {
  setPage: (ctx: ContextMessageUpdate, page: number) => Promise<void> | void;
  getCurrentPage: ContextFunc<number | undefined>;
  getTotalPages: ContextFunc<number>;
  hide?: ContextFunc<boolean>;
}

interface QuestionOptions extends ButtonOptions {
  questionText: string;
  setFunc: (ctx: ContextMessageUpdate, answer: string) => Promise<void> | void;
}

interface SelectPaginationOptions {
  columns?: number;
  maxRows?: number;
  setPage?: (ctx: ContextMessageUpdate, page: number) => Promise<void> | void;
  getCurrentPage?: ContextFunc<number | undefined>;
}

interface SelectActionOptions extends SelectButtonCreatorOptions, SelectPaginationOptions {
  setFunc: ContextKeyFunc<void>;
  hide?: ContextKeyFunc<boolean>;
  setMenuAfter?: boolean;
  setParentMenuAfter?: boolean;
}

interface OldSelectSubmenuOptions extends SelectButtonCreatorOptions, SelectPaginationOptions {
  submenu: TelegrafInlineMenu;
  hide?: ContextFunc<boolean>;
}

interface SelectSubmenuOptions extends SelectButtonCreatorOptions, SelectPaginationOptions {
  hide?: ContextFunc<boolean>;
}

interface ToggleOptions extends ButtonOptions, PrefixOptions {
  setFunc: (ctx: ContextMessageUpdate, newState: boolean) => Promise<void> | void;
  isSetFunc: ContextFunc<boolean>;
}

export default class TelegrafInlineMenu {
  protected readonly actions = new DuplicateActionGuardian()

  protected readonly buttons = new MenuButtons()

  protected readonly responders = new MenuResponders()

  protected readonly commands: string[] = []

  protected readonly submenus: SubmenuEntry[] = []

  protected readonly replyMenuMiddlewares: ReplyMenuMiddleware[] = []

  protected readonly menuPhoto?: ConstOrContextFunc<Photo | undefined>

  constructor(
    protected menuText: ConstOrContextFunc<string>,
    additionals: MenuAdditionals = {}
  ) {
    this.menuPhoto = additionals.photo
  }

  // TODO: BREAKING CHANGE: use ...commands: string[]
  // There will be nothing else to do and it is a lot simpler to use
  setCommand(commands: string | string[]): TelegrafInlineMenu {
    if (!Array.isArray(commands)) {
      commands = [commands]
    }

    for (const c of commands) {
      this.commands.push(c)
    }

    return this
  }

  replyMenuMiddleware(): ReplyMenuMiddleware {
    const obj: ReplyMenuMiddleware = {
      middleware: () =>
        async (ctx: ContextMessageUpdate) => obj.setSpecific(ctx, ''),
      setSpecific: async (ctx: ContextMessageUpdate, actionCode: string) => {
        if (!obj.setMenuFunc) {
          throw new Error('This does only work when menu is initialized with bot.use(menu.init())')
        }

        return obj.setMenuFunc(ctx, actionCode)
      }
    }

    this.replyMenuMiddlewares.push(obj)
    return obj
  }

  init(userOptions: MenuOptions = {}): ContextNextFunc {
    // Debug
    // userOptions.log = (...args) => console.log(new Date(), ...args)
    const {actionCode, internalOptions} = normalizeOptions(userOptions)
    internalOptions.log('init', internalOptions)
    const middleware = this.middleware(actionCode, internalOptions)
    internalOptions.log('init finished')
    return middleware
  }

  urlButton(text: ConstOrContextFunc<string>, url: ConstOrContextFunc<string>, additionalArgs: ButtonOptions = {}): TelegrafInlineMenu {
    this.buttons.add({
      text,
      url,
      hide: additionalArgs.hide
    }, !additionalArgs.joinLastRow)
    return this
  }

  switchToChatButton(text: ConstOrContextFunc<string>, value: ConstOrContextFunc<string>, additionalArgs: ButtonOptions = {}): TelegrafInlineMenu {
    this.buttons.add({
      text,
      switchToChat: value,
      hide: additionalArgs.hide
    }, !additionalArgs.joinLastRow)
    return this
  }

  switchToCurrentChatButton(text: ConstOrContextFunc<string>, value: ConstOrContextFunc<string>, additionalArgs: ButtonOptions = {}): TelegrafInlineMenu {
    this.buttons.add({
      text,
      switchToCurrentChat: value,
      hide: additionalArgs.hide
    }, !additionalArgs.joinLastRow)
    return this
  }

  manual(text: ConstOrContextFunc<string>, action: string, additionalArgs: ActionButtonOptions = {}): TelegrafInlineMenu {
    this.buttons.add({
      text,
      action,
      root: additionalArgs.root,
      hide: additionalArgs.hide
    }, !additionalArgs.joinLastRow)
    return this
  }

  // This button does not update the menu after being pressed
  simpleButton(text: ConstOrContextFunc<string>, action: string, additionalArgs: SimpleButtonOptions): TelegrafInlineMenu {
    assert(additionalArgs.doFunc, 'doFunc is not set. set it or use menu.manual')

    this.responders.add({
      action: this.actions.addStatic(action),
      hide: additionalArgs.hide,
      middleware: additionalArgs.doFunc,
      setParentMenuAfter: additionalArgs.setParentMenuAfter,
      setMenuAfter: additionalArgs.setMenuAfter
    })
    return this.manual(text, action, additionalArgs)
  }

  button(text: ConstOrContextFunc<string>, action: string, additionalArgs: SimpleButtonOptions): TelegrafInlineMenu {
    additionalArgs.setMenuAfter = true
    return this.simpleButton(text, action, additionalArgs)
  }

  pagination(action: string, additionalArgs: PaginationOptions): TelegrafInlineMenu {
    const {setPage, getCurrentPage, getTotalPages, hide} = additionalArgs

    const pageFromCtx = async (ctx: any): Promise<number> => {
      const number = Number(ctx.match[ctx.match.length - 1])
      const totalPages = Math.ceil(await getTotalPages(ctx))
      return Math.max(1, Math.min(totalPages, number)) || 1
    }

    this.responders.add({
      middleware: async ctx => setPage(ctx, await pageFromCtx(ctx)),
      action: this.actions.addDynamic(action),
      hide,
      setMenuAfter: true
    })

    const createPaginationButtons = async (ctx: ContextMessageUpdate): Promise<{[key: string]: string}> => {
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

  question(text: ConstOrContextFunc<string>, action: string, additionalArgs: QuestionOptions): TelegrafInlineMenu {
    const {questionText, setFunc, hide} = additionalArgs
    assert(questionText, 'questionText is not set. set it')
    assert(setFunc, 'setFunc is not set. set it')

    const parseQuestionAnswer = async (ctx: any): Promise<void> => {
      const answer = ctx.message.text
      await setFunc(ctx, answer)
    }

    this.responders.add({
      hide,
      setMenuAfter: true,
      only: ctx => Boolean(ctx.message && ctx.message.reply_to_message && ctx.message.reply_to_message.text === questionText),
      middleware: parseQuestionAnswer
    })

    const hitQuestionButton = async (ctx: any): Promise<void> => {
      const extra = Extra.markup(Markup.forceReply())
      await Promise.all([
        ctx.reply(questionText, extra),
        ctx.answerCbQuery(),
        ctx.deleteMessage()
          .catch((error: Error) => {
            if (error.message.includes('can\'t be deleted')) {
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

  select(action: string, options: ConstOrContextFunc<SelectOptions>, additionalArgs: SelectActionOptions | OldSelectSubmenuOptions): TelegrafInlineMenu {
    if ('submenu' in additionalArgs) {
      // TODO: BREAKING CHANGE
      // throw new Error('Use menu.selectSubmenu() instead!')
      console.warn('menu.select() with submenu is depricated. Use menu.selectSubmenu() instead!')

      return this.selectSubmenu(action, options, additionalArgs.submenu, additionalArgs)
    }

    const {setFunc, hide} = additionalArgs
    const keyFromCtx = (ctx: any): string => ctx.match[ctx.match.length - 1]
    const optionsFunc = typeof options === 'function' ? options : () => options

    this.responders.add({
      middleware: async ctx => setFunc(ctx, keyFromCtx(ctx)),
      action: this.actions.addDynamic(action),
      hide: selectHideFunc(keyFromCtx, optionsFunc, hide),
      setParentMenuAfter: additionalArgs.setParentMenuAfter,
      setMenuAfter: true
    })

    this.buttons.addCreator(selectButtonCreator(action, optionsFunc, additionalArgs))
    this._selectPagination(action, optionsFunc, additionalArgs)
    return this
  }

  selectSubmenu(action: string, options: ConstOrContextFunc<SelectOptions>, submenu: TelegrafInlineMenu, additionalArgs: SelectSubmenuOptions = {}): TelegrafInlineMenu {
    const {hide} = additionalArgs

    this.submenus.push({
      submenu,
      action: this.actions.addDynamic(action),
      hide
    })

    const optionsFunc = typeof options === 'function' ? options : () => options
    this.buttons.addCreator(selectButtonCreator(action, optionsFunc, additionalArgs))
    this._selectPagination(action, optionsFunc, additionalArgs)
    return submenu
  }

  toggle(text: ConstOrContextFunc<string>, action: string, additionalArgs: ToggleOptions): TelegrafInlineMenu {
    const {setFunc, isSetFunc, hide} = additionalArgs
    assert(setFunc, 'setFunc is not set. set it')
    assert(isSetFunc, 'isSetFunc is not set. set it')

    const hideFunc = async (ctx: ContextMessageUpdate, state: boolean): Promise<boolean> => {
      if (hide && await hide(ctx)) {
        return true
      }

      const isSet = Boolean(await isSetFunc(ctx))
      return isSet === state
    }

    this.button(async ctx => prefixEmoji(text, false, additionalArgs, ctx), `${action}-true`, {
      ...additionalArgs,
      doFunc: async ctx => setFunc(ctx, true),
      hide: async ctx => hideFunc(ctx, true)
    })

    this.button(async ctx => prefixEmoji(text, true, additionalArgs, ctx), `${action}-false`, {
      ...additionalArgs,
      doFunc: async ctx => setFunc(ctx, false),
      hide: async ctx => hideFunc(ctx, false)
    })

    return this
  }

  submenu(text: ConstOrContextFunc<string>, action: string, submenu: TelegrafInlineMenu, additionalArgs: ButtonOptions = {}): TelegrafInlineMenu {
    this.manual(text, action, additionalArgs)
    this.submenus.push({
      action: this.actions.addStatic(action),
      hide: additionalArgs.hide,
      submenu
    })
    return submenu
  }

  protected async generate(ctx: ContextMessageUpdate, actionCode: ActionCode, options: InternalMenuOptions): Promise<{text: string; extra: Extra}> {
    options.log('generate…', actionCode.get())
    const text = typeof this.menuText === 'function' ? await this.menuText(ctx) : this.menuText

    let actualActionCode: string
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
      actualActionCode = new ActionCode(menuAction).getString()
      options.log('generate with actualActionCode', actualActionCode, actionCode.get(), ctx.callbackQuery.data)
    } else {
      actualActionCode = actionCode.getString()
    }

    const keyboardMarkup = await this.buttons.generateKeyboardMarkup(ctx, actualActionCode, options)
    options.log('buttons', keyboardMarkup.inline_keyboard)
    const extra = Extra.markdown().markup(keyboardMarkup) as Extra
    return {text, extra}
  }

  protected async setMenuNow(ctx: any, actionCode: ActionCode, options: InternalMenuOptions): Promise<void> {
    const {text, extra} = await this.generate(ctx, actionCode, options)

    const photo = typeof this.menuPhoto === 'function' ? await this.menuPhoto(ctx) : this.menuPhoto
    const photoExtra = new Extra({
      caption: text,
      ...extra
    })

    const isPhotoMessage = Boolean(ctx.callbackQuery && ctx.callbackQuery.message && ctx.callbackQuery.message.photo)

    if (ctx.updateType !== 'callback_query' || isPhotoMessage !== Boolean(photo)) {
      if (ctx.updateType === 'callback_query') {
        ctx.deleteMessage().catch(() => {})
      }

      if (photo) {
        await ctx.replyWithPhoto(photo, photoExtra)
      } else {
        await ctx.reply(text, extra)
      }

      return
    }

    await ctx.answerCbQuery()

    try {
      // When photo is set it is a photo message
      // isPhotoMessage !== photo is ensured above
      if (photo) {
        const media = {
          type: 'photo',
          media: photo,
          caption: text
        }

        await ctx.editMessageMedia(media, photoExtra)
      } else {
        await ctx.editMessageText(text, extra)
      }
    } catch (error) {
      if (error.message.startsWith('400: Bad Request: message is not modified')) {
        // This is kind of ok.
        // Not changed stuff should not be sended but sometimes it happens…
        console.warn('menu is not modified. Think about preventing this. Happened while setting menu', actionCode.get())
        return
      }

      throw error
    }
  }

  protected middleware(actionCode: ActionCode, options: InternalMenuOptions): ContextNextFunc {
    assert(actionCode, 'use this menu with .init(): bot.use(menu.init(args))')

    if (actionCode.isDynamic()) {
      assert(this.commands.length === 0, `commands can not point on dynamic submenus. Happened in menu ${actionCode.get()} with the following commands: ${this.commands.join(', ')}`)

      const hasResponderWithoutAction = this.responders.hasSomeNonActionResponders()
      assert(!hasResponderWithoutAction, `a dynamic submenu can only contain buttons. A question for example does not work. Happened in menu ${actionCode.get()}`)
    }

    options.log('middleware triggered', actionCode.get(), options, this)
    options.log('add action reaction', actionCode.get(), 'setMenu')
    const setMenuFunc = async (ctx: any, reason: string, actionOverride?: ActionCode): Promise<void> => {
      if (actionOverride) {
        ctx.match = actionCode.exec(actionOverride.getString())
      }

      options.log('set menu', (actionOverride || actionCode).get(), reason, this)
      return this.setMenuNow(ctx, actionOverride || actionCode, options)
    }

    const functions = []
    if (this.commands.length > 0) {
      const myComposer: any = Composer
      functions.push(myComposer.command(this.commands, async (ctx: any) => setMenuFunc(ctx, 'command')))
    }

    for (const replyMenuMiddleware of this.replyMenuMiddlewares) {
      assert(!replyMenuMiddleware.setMenuFunc, 'replyMenuMiddleware does not work on a menu that is reachable on multiple different ways. This could be implemented but there wasnt a need for this yet. Open an issue on GitHub.')

      replyMenuMiddleware.setMenuFunc = async (ctx, actionOverride) => {
        assert(!actionCode.isDynamic() || actionOverride, 'a dynamic menu can only be set when an actionCode is given')

        if (actionOverride) {
          assert(actionCode.test(actionOverride), `The actionCode has to belong to the menu. ${actionOverride} does not work with the menu ${actionCode.get()}`)
        }

        return setMenuFunc(ctx, 'replyMenuMiddleware', actionOverride ? new ActionCode(actionOverride) : actionCode)
      }
    }

    const subOptions: InternalMenuOptions = {
      ...options,
      setParentMenuFunc: setMenuFunc,
      depth: Number(options.depth) + 1
    }

    const handlerFuncs = this.submenus
      .map(({action, submenu, hide}) => {
        const childActionCode = actionCode.concat(action)
        const hiddenFunc: ContextNextFunc = async (ctx, next): Promise<void> => {
          if (!ctx.callbackQuery) {
            // Only set menu when a hidden button below was used
            // Without callbackData this can not be determined
            return next(ctx)
          }

          return setMenuFunc(ctx, 'menu is hidden')
        }

        const mainFunc = submenu.middleware(childActionCode, subOptions)

        const m = new CombinedMiddleware(mainFunc, hiddenFunc)
          .addOnly(ctx => !ctx.callbackQuery || !ctx.callbackQuery.data || childActionCode.testIsBelow(ctx.callbackQuery.data))

        if (hide) {
          m.addHide(hide)
        }

        return m.middleware()
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

  private _selectPagination(baseAction: string, optionsFunc: ContextFunc<SelectOptions>, additionalArgs: SelectPaginationOptions): void {
    const {setPage, getCurrentPage, columns, maxRows} = additionalArgs
    const maxButtons = maximumButtonsPerPage(columns, maxRows)

    if (setPage && getCurrentPage) {
      this.pagination(`${baseAction}Page`, {
        setPage,
        getCurrentPage,
        getTotalPages: async ctx => {
          const optionsResult = await optionsFunc(ctx)
          const keys = Array.isArray(optionsResult) ? optionsResult : Object.keys(optionsResult)
          return keys.length / maxButtons
        }
      })
    } else if (!setPage && !getCurrentPage) {
      // No pagination
    } else {
      throw new Error('setPage and getCurrentPage have to be provided both in order to have a propper pagination.')
    }
  }
}

function assert(value: any, message: string): void {
  if (value) {
    // Everything is ok
    return
  }

  throw new Error(message)
}

// For CommonJS default export support
module.exports = TelegrafInlineMenu
module.exports.default = TelegrafInlineMenu
