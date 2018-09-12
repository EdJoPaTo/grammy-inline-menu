class ActionCode {
  constructor(actionCode) {
    if (actionCode instanceof RegExp) {
      if (actionCode.flags.replace('i', '') !== '') {
        throw new Error('flags exept i are not supported')
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

  concat(action) {
    return ActionCode.concat(this.code, action)
  }

  static concat(prefix, action) {
    if (prefix instanceof ActionCode) {
      prefix = prefix.code
    }
    if (action instanceof ActionCode) {
      action = action.code
    }
    if (prefix instanceof RegExp) {
      throw new TypeError('concat to an RegExp is currently not supported. Open an Issue for it.')
    }
    if ((prefix || 'main') === 'main') {
      return new ActionCode(action)
    }
    if (action instanceof RegExp) {
      const source = prefix + ':' + action.source
      return new ActionCode(new RegExp(source, action.flags))
    }
    return new ActionCode(prefix + ':' + action)
  }

  parent() {
    return ActionCode.parent(this.code)
  }

  static parent(actionCode) {
    const parts = actionCode.split(':')
    // Remove current
    parts.pop()
    const parent = parts.join(':')
    return new ActionCode(parent || 'main')
  }
}

module.exports = ActionCode
