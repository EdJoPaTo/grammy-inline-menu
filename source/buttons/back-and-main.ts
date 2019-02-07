import ActionCode from '../action-code'
import {ButtonInfo} from '../build-keyboard'
import {InternalMenuOptions} from '../menu-options'

export function generateBackButtons(actionCode: ActionCode, options: InternalMenuOptions): ButtonInfo[] {
  const {depth, hasMainMenu, backButtonText, mainMenuButtonText} = options
  if (actionCode.get() === 'main' || depth === 0) {
    return []
  }

  const buttons: ButtonInfo[] = []

  if (depth > 1 && backButtonText) {
    buttons.push({
      text: backButtonText,
      action: actionCode.parent().getString(),
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

module.exports = {
  generateBackButtons
}
