export const DEFAULT_BUTTON_COLUMNS = 6
export const DEFAULT_BUTTON_ROWS = 10

export function getRowsOfButtons<T>(buttons: T[], columns = DEFAULT_BUTTON_COLUMNS, maxRows = DEFAULT_BUTTON_ROWS): T[][] {
  const maxButtons = Math.min(maxRows * columns, buttons.length)
  const rows = []
  for (let i = 0; i < maxButtons; i += columns) {
    const slice = buttons.slice(i, i + columns)
    rows.push(slice)
  }

  return rows
}

module.exports = {
  DEFAULT_BUTTON_COLUMNS,
  DEFAULT_BUTTON_ROWS,
  getRowsOfButtons
}
