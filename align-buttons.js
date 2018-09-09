function getRowsOfButtons(buttons, columns) {
  if (!columns) {
    columns = buttons.length
  }
  const rows = []
  for (let i = 0; i < buttons.length; i += columns) {
    const slice = buttons.slice(i, i + columns)
    rows.push(slice)
  }
  return rows
}

module.exports = {
  getRowsOfButtons
}
