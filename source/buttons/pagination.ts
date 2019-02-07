/**
 * Creates ButtonOptions for the paginator
 *
 * @param  totalPages  total amount of pages. Array.length is a good way to return this one.
 * @param  currentPage current page. Has to be between [1..totalPages]
 * @return returns the ButtonOptions
 */
export function paginationOptions(totalPages: number, currentPage: number): {} {
  // Numbers have to be within
  // currentPage in [1..totalPages]
  const totalPagesFixed = Math.ceil(totalPages)
  const currentPageFixed = Math.max(1, Math.min(totalPagesFixed, Math.floor(currentPage)))

  const buttons: any = {}
  if (!isFinite(totalPagesFixed) || !isFinite(currentPage) || totalPagesFixed < 2) {
    return buttons
  }

  const before = currentPageFixed - 1
  const after = currentPageFixed + 1

  if (currentPageFixed > 1) {
    if (before > 1) {
      buttons[1] = '⏪ 1'
    }

    buttons[before] = `◀️ ${before}`
  }

  buttons[currentPageFixed] = String(currentPageFixed)

  if (currentPageFixed < totalPagesFixed) {
    buttons[after] = `▶️ ${after}`

    if (after < totalPagesFixed) {
      buttons[totalPagesFixed] = `⏩ ${totalPagesFixed}`
    }
  }

  return buttons
}
