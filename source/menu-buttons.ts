import {InlineKeyboardMarkup} from 'telegram-typings'

import {ButtonInfo, buildKeyboard} from './build-keyboard'
import {InternalMenuOptions} from './menu-options'

import {generateBackButtons} from './buttons/back-and-main'

type ButtonRow = ButtonInfo[]
type KeyboardPartCreator = (ctx: any) => (Promise<ButtonRow[]> | ButtonRow[])

class MenuButtons {
  readonly buttons: (ButtonRow | KeyboardPartCreator)[] = []

  async generateKeyboardMarkup(ctx: any, actionCodePrefix: string, options: InternalMenuOptions): Promise<InlineKeyboardMarkup> {
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

export default MenuButtons

module.exports = MenuButtons
