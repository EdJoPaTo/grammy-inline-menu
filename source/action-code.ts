const assert = require('assert').strict

class ActionCode {
  readonly code: string | RegExp

  constructor(actionCode: string | RegExp) {
    if (actionCode instanceof RegExp) {
      assert(!actionCode.flags, 'RegExp flags are not supported')
      assert(!actionCode.source.startsWith('^') && !actionCode.source.endsWith('$'), 'begin or end anchors are not supported (^, $)')

      this.code = actionCode
    } else if (typeof actionCode === 'string') {
      this.code = actionCode || 'main'
    } else {
      throw new TypeError('ActionCode must be a regex or string')
    }
  }

  get(): string | RegExp {
    if (this.code instanceof RegExp) {
      const {source, flags} = this.code
      const newSource = `^${source}$`
      return new RegExp(newSource, flags)
    }

    return this.code
  }

  getRegex(): RegExp {
    if (this.code instanceof RegExp) {
      const {source, flags} = this.code
      const newSource = `^${source}$`
      return new RegExp(newSource, flags)
    }

    return new RegExp(`^${this.code}$`)
  }

  exec(value: string): RegExpExecArray | null {
    return this.getRegex().exec(value)
  }

  test(value: string): boolean {
    return this.getRegex().test(value)
  }

  testIsBelow(value: string): boolean {
    const source = this.code instanceof RegExp ? this.code.source : this.code
    const regex = new RegExp(`^${source}`)
    return regex.test(value)
  }

  isDynamic(): boolean {
    return this.code instanceof RegExp
  }

  concat(action: string | RegExp | ActionCode): ActionCode {
    const actionExtract = action instanceof ActionCode ? action.code : action

    if (this.code === 'main') {
      return new ActionCode(actionExtract)
    }

    if (typeof this.code === 'string' && typeof actionExtract === 'string') {
      return new ActionCode(this.code + ':' + actionExtract)
    }

    const prefix = this.code instanceof RegExp ? this.code.source : this.code
    const actionString = actionExtract instanceof RegExp ? actionExtract.source : actionExtract
    return new ActionCode(new RegExp(prefix + ':' + actionString))
  }

  parent(): ActionCode {
    let parts = []
    if (this.code instanceof RegExp) {
      const {source} = this.code
      const regex = /(?:(?:\[\^[^\]]*:[^\]]*\])|(?:[^:]))+/g
      let match
      do {
        match = regex.exec(source)
        if (match) {
          parts.push(match)
        }
      } while (match)
    } else {
      parts = this.code.split(':')
    }

    // Remove current
    parts.pop()
    const parent = parts.join(':')
    let newCode
    if (parent) {
      newCode = this.code instanceof RegExp ? new RegExp(parent) : parent
    } else {
      newCode = 'main'
    }

    return new ActionCode(newCode)
  }
}

export default ActionCode

module.exports = ActionCode
