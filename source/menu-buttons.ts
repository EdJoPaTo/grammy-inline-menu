import {Context as TelegrafContext} from 'telegraf'
import {InlineKeyboardMarkup} from 'telegram-typings'

import {InternalMenuOptions} from './menu-options'

import {buildKeyboard} from './buttons/build-keyboard'
import {ButtonInfo, ButtonRow, KeyboardPartCreator} from './buttons/types'
import {generateBackButtons} from './buttons/back-and-main'

export default class MenuButtons {
  readonly buttons: (ButtonRow | KeyboardPartCreator)[] = []

  async generateKeyboardMarkup(ctx: TelegrafContext, actionCodePrefix: string, options: InternalMenuOptions): Promise<InlineKeyboardMarkup> {
    const resultButtons = [
      ...this.buttons,
      generateBackButtons(actionCodePrefix, options)
    ]
    options.log('create keyboard with buttons', resultButtons)

    return buildKeyboard(resultButtons, actionCodePrefix, ctx)
  }

  add(button: ButtonInfo, ownRow = true): void {
    const lastEntry = this.buttons.slice(-1)[0]

    if (ownRow || !lastEntry || typeof lastEntry === 'function') {
      this.buttons.push([])
    }

    const lastRow = this.buttons[this.buttons.length - 1] as ButtonInfo[]
    lastRow.push(button)
  }

  addCreator(creator: KeyboardPartCreator): void {
    this.buttons.push(creator)
  }
}
