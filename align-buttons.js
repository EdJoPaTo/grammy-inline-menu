function getRowsOfButtons(buttons, columns = 6, maxRows = 10) {
  const maxButtons = Math.min(maxRows * columns, buttons.length)
  const rows = []
  for (let i = 0; i < maxButtons; i += columns) {
    const slice = buttons.slice(i, i + columns)
    rows.push(slice)
  }

  return rows
}

module.exports = {
  getRowsOfButtons
}
