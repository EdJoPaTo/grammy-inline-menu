import {BasicOptions} from './basic'
import {ContextFunc, ConstOrPromise} from '../generic-types'

export type SetPageFunction<Context> = (context: Context, page: number) => ConstOrPromise<void>
export type GetCurrentPageFunction<Context> = ContextFunc<Context, number | undefined>
export type GetTotalPagesFunction<Context> = ContextFunc<Context, number>

export interface GenericPaginationOptions<Context> {
	readonly setPage: SetPageFunction<Context>;
	readonly getCurrentPage: GetCurrentPageFunction<Context>;
}

export interface PaginationOptions<Context> extends BasicOptions<Context>, GenericPaginationOptions<Context> {
	readonly getTotalPages: GetTotalPagesFunction<Context>;
}

/**
 * Creates Choices for the paginator
 * @param  totalPages  total amount of pages. Array.length is a good way to return this one.
 * @param  currentPage current page. Has to be between [1..totalPages]
 * @return returns the Choices
 */
export function createPaginationChoices(totalPages: number, currentPage: number | undefined): Record<number, string> {
	// Numbers have to be within
	// currentPage in [1..totalPages]
	const totalPagesFixed = Math.ceil(totalPages)
	const currentPageFinite = (currentPage !== undefined && Number.isFinite(currentPage)) ? currentPage : 1
	const currentPageFixed = Math.max(1, Math.min(totalPagesFixed, Math.floor(currentPageFinite)))

	const buttons: Record<number, string> = {}
	if (!Number.isFinite(totalPagesFixed) || !Number.isFinite(currentPageFixed) || totalPagesFixed < 2) {
		return buttons
	}

	const before = currentPageFixed - 1
	const after = currentPageFixed + 1

	if (currentPageFixed > 1) {
		if (before > 1) {
			buttons[1] = '1 ⏪'
		}

		buttons[before] = `${before} ◀️`
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
