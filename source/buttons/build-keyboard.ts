import {ContextMessageUpdate} from 'telegraf'
import {InlineKeyboardMarkup, InlineKeyboardButton} from 'telegram-typings'

import {buildKeyboardButton} from './build-keyboard-button'
import {ButtonInfo, ButtonRow, KeyboardPartCreator} from './types'

export async function buildKeyboard(content: (ButtonRow | KeyboardPartCreator)[], actionCodePrefix: string, ctx: ContextMessageUpdate): Promise<InlineKeyboardMarkup> {
  const resultButtons: InlineKeyboardButton[][][] = await Promise.all(content.map(async row => {
    if (typeof row === 'function') {
      const innerKeyboard = await row(ctx)
      return Promise.all(innerKeyboard.map(async innerRow => buildKeyboardRow(innerRow, actionCodePrefix, ctx)))
    }

    return [await buildKeyboardRow(row, actionCodePrefix, ctx)]
  }))
  const resultButtonsFlatted = resultButtons
    // .flat(1) requires NodeJS 11 / ES2019. This would be nice but is to far away for now.
    .reduce((accumulator, currentValue) => accumulator.concat(currentValue), [])
    .filter(o => o.length > 0)
  return {
    inline_keyboard: resultButtonsFlatted
  }
}

async function buildKeyboardRow(row: ButtonInfo[], actionCodePrefix: string, ctx: ContextMessageUpdate): Promise<InlineKeyboardButton[]> {
  const buttons = await Promise.all(
    row.map(async buttonInfo => buildKeyboardButton(buttonInfo, actionCodePrefix, ctx))
  )
  const withoutHidden = buttons
    .filter(o => o !== undefined) as InlineKeyboardButton[]
  return withoutHidden
}
