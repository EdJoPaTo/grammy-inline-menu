export const DEFAULT_BUTTON_COLUMNS = 6
export const DEFAULT_BUTTON_ROWS = 10

export function getRowsOfButtons<T>(buttons: readonly T[], columns = DEFAULT_BUTTON_COLUMNS, maxRows = DEFAULT_BUTTON_ROWS, page = 1): T[][] {
  const buttonsPerPage = maximumButtonsPerPage(columns, maxRows)
  const totalPages = Math.ceil(buttons.length / buttonsPerPage)
  const selectedPage = Math.max(Math.min(page, totalPages), 1)

  const pageOffset = (selectedPage - 1) * maxRows * columns
  const maxButtonsToShow = Math.min(buttonsPerPage, buttons.length - pageOffset)

  const rows = []
  for (let i = pageOffset; i < maxButtonsToShow + pageOffset; i += columns) {
    const slice = buttons.slice(i, i + columns)
    rows.push(slice)
  }

  return rows
}

export function maximumButtonsPerPage(columns = DEFAULT_BUTTON_COLUMNS, maxRows = DEFAULT_BUTTON_ROWS): number {
  return columns * maxRows
}
