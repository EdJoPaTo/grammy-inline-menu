class ActionCode {
  constructor(actionCode) {
    if (actionCode instanceof RegExp) {
      if (actionCode.flags.replace('i', '') !== '') {
        throw new Error('flags exept i are not supported')
      }
      console.assert(actionCode.flags === '', 'using ActionCode with RegExp Flags is depricated')
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

  exec(value = '') {
    return this.getRegex().exec(value)
  }

  test(value = '') {
    return this.getRegex().test(value)
  }

  concat(action) {
    if (action instanceof ActionCode) {
      action = action.code
    }
    if (this.code instanceof RegExp) {
      throw new TypeError('concat to an RegExp is currently not supported. Open an Issue for it.')
    }
    if (this.code === 'main') {
      return new ActionCode(action)
    }
    if (action instanceof RegExp) {
      const source = this.code + ':' + action.source
      return new ActionCode(new RegExp(source, action.flags))
    }
    return new ActionCode(this.code + ':' + action)
  }

  parent() {
    const parts = this.code.split(':')
    // Remove current
    parts.pop()
    const parent = parts.join(':')
    return new ActionCode(parent || 'main')
  }
}

module.exports = ActionCode
