class ActionCode {
  constructor(actionCode) {
    if (actionCode instanceof RegExp) {
      if (actionCode.flags !== '') {
        throw new Error('RegExp flags are not supported')
      }
      if (actionCode.source.startsWith('^') || actionCode.source.endsWith('$')) {
        throw new Error('begin or end anchors are not supported (^, $)')
      }
      this.code = actionCode
    } else if (typeof actionCode === 'string') {
      this.code = actionCode || 'main'
    } else {
      throw new TypeError('ActionCode must be a regex or string')
    }
  }

  get() {
    if (this.code instanceof RegExp) {
      const {source, flags} = this.code
      const newSource = `^${source}$`
      return new RegExp(newSource, flags)
    }

    return this.code
  }

  getRegex() {
    if (this.code instanceof RegExp) {
      const {source, flags} = this.code
      const newSource = `^${source}$`
      return new RegExp(newSource, flags)
    }
    return new RegExp(`^${this.code}$`)
  }

  exec(value) {
    return this.getRegex().exec(value)
  }

  test(value) {
    return this.getRegex().test(value)
  }

  concat(action) {
    if (action instanceof ActionCode) {
      action = action.code
    }
    if (this.code === 'main') {
      return new ActionCode(action)
    }
    if (typeof this.code === 'string' && typeof action === 'string') {
      return new ActionCode(this.code + ':' + action)
    }
    const prefix = this.code.source || this.code
    action = action.source || action
    return new ActionCode(new RegExp(prefix + ':' + action))
  }

  parent() {
    const isRegex = this.code instanceof RegExp
    const content = isRegex ? this.code.source : this.code
    const parts = content.split(':')
    // Remove current
    parts.pop()
    const parent = parts.join(':')
    let newCode
    if (parent) {
      newCode = isRegex ? new RegExp(parent) : parent
    } else {
      newCode = 'main'
    }
    return new ActionCode(newCode)
  }
}

module.exports = ActionCode
