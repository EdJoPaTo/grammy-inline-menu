export const DEFAULT_BUTTON_COLUMNS = 6
export const DEFAULT_BUTTON_ROWS = 10

export function getRowsOfButtons<T>(buttons: T[], columns = DEFAULT_BUTTON_COLUMNS, maxRows = DEFAULT_BUTTON_ROWS, page = 1): T[][] {
  const maxButtons = Math.min(maxRows * columns, buttons.length)
  const pageOffset = (page - 1) * maxRows * columns
  const rows = []
  for (let i = pageOffset; i < maxButtons + pageOffset; i += columns) {
    const slice = buttons.slice(i, i + columns)
    rows.push(slice)
  }

  return rows
}

export function maximumButtonsPerPage(columns = DEFAULT_BUTTON_COLUMNS, maxRows = DEFAULT_BUTTON_ROWS): number {
  return columns * maxRows
}
