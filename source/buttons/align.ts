const DEFAULT_BUTTON_COLUMNS = 6;
const DEFAULT_BUTTON_ROWS = 10;

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export function getRowsOfButtons<T>(
	buttons: readonly T[],
	columns = DEFAULT_BUTTON_COLUMNS,
	maxRows = DEFAULT_BUTTON_ROWS,
	page = 1,
): T[][] {
	const relevantButtons = getButtonsOfPage(buttons, columns, maxRows, page);
	return getButtonsAsRows(relevantButtons, columns);
}

export function getButtonsOfPage<T>(
	buttons: readonly T[],
	columns = DEFAULT_BUTTON_COLUMNS,
	maxRows = DEFAULT_BUTTON_ROWS,
	page = 1,
): T[] {
	const buttonsPerPage = maximumButtonsPerPage(columns, maxRows);
	const totalPages = Math.ceil(buttons.length / buttonsPerPage);
	const selectedPage = clamp(page, 1, totalPages);

	const pageOffset = (selectedPage - 1) * buttonsPerPage;
	return buttons.slice(pageOffset, pageOffset + buttonsPerPage);
}

export function getButtonsAsRows<T>(
	buttons: readonly T[],
	columns = DEFAULT_BUTTON_COLUMNS,
): T[][] {
	const totalRows = Math.ceil(buttons.length / columns);
	const rows: T[][] = [];
	for (let i = 0; i < totalRows; i++) {
		const slice = buttons.slice(i * columns, (i + 1) * columns);
		rows.push(slice);
	}

	return rows;
}

export function maximumButtonsPerPage(
	columns = DEFAULT_BUTTON_COLUMNS,
	maxRows = DEFAULT_BUTTON_ROWS,
): number {
	return columns * maxRows;
}
