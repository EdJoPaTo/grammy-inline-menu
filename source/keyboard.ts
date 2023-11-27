import {Buffer} from 'node:buffer';
import type {InlineKeyboardButton as TelegramInlineKeyboardButton} from 'grammy/types';
import type {ReadonlyDeep} from 'type-fest';
import {
	type ConstOrContextPathFunc,
	type ContextPathFunc,
	filterNonNullable,
} from './generic-types.js';
import {combinePath} from './path.js';

export type CallbackButtonTemplate = {
	readonly text: string;
	readonly relativePath: string;
};

export type InlineKeyboardButton = ReadonlyDeep<TelegramInlineKeyboardButton>;
export type InlineKeyboard = ReadonlyArray<readonly InlineKeyboardButton[]>;

export type ButtonTemplate = CallbackButtonTemplate | InlineKeyboardButton;
export type ButtonTemplateRow = readonly ButtonTemplate[];

type UncreatedTemplate<Context> = ConstOrContextPathFunc<Context, ButtonTemplate | undefined>;
type RowOfUncreatedTemplates<Context> = Array<UncreatedTemplate<Context>>;
type ButtonTemplateRowGenerator<Context> = ContextPathFunc<Context, ButtonTemplateRow[]>;
type KeyboardTemplateEntry<Context> =
	| RowOfUncreatedTemplates<Context>
	| ButtonTemplateRowGenerator<Context>;

function isRow<Context>(
	entry: undefined | ReadonlyDeep<KeyboardTemplateEntry<Context>>,
): entry is RowOfUncreatedTemplates<Context> {
	return Array.isArray(entry);
}

function isCallbackButtonTemplate(
	kindOfButton: ButtonTemplate,
): kindOfButton is CallbackButtonTemplate {
	return 'text' in kindOfButton && 'relativePath' in kindOfButton;
}

export class Keyboard<Context> {
	readonly #entries: Array<KeyboardTemplateEntry<Context>> = [];

	addCreator(creator: ButtonTemplateRowGenerator<Context>): void {
		this.#entries.push(creator);
	}

	add(
		joinLastRow: boolean,
		...buttons: ReadonlyArray<UncreatedTemplate<Context>>
	): void {
		const lastEntry = this.#entries.at(-1);

		if (joinLastRow && isRow(lastEntry)) {
			lastEntry.push(...buttons);
			return;
		}

		this.#entries.push([...buttons]);
	}

	async render(context: Context, path: string): Promise<InlineKeyboard> {
		const arrayOfRowArrays = await Promise.all(
			// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
			this.#entries.map(async o => entryToRows(o, context, path)),
		);
		const rows = arrayOfRowArrays
			.flat(1)
			.map(row => renderRow(row, path))
			.filter(o => o.length > 0);
		return rows;
	}
}

async function entryToRows<Context>(
	entry: ReadonlyDeep<KeyboardTemplateEntry<Context>>,
	context: Context,
	path: string,
): Promise<ButtonTemplateRow[]> {
	if (typeof entry === 'function') {
		return entry(context, path);
	}

	const buttonsInRow = await Promise.all(
		entry.map(async button =>
			typeof button === 'function' ? button(context, path) : button,
		),
	);
	const filtered = buttonsInRow.filter(filterNonNullable());
	return [filtered];
}

function renderRow(
	templates: readonly ButtonTemplate[],
	path: string,
): readonly InlineKeyboardButton[] {
	return templates.map(template =>
		isCallbackButtonTemplate(template)
			? renderCallbackButtonTemplate(template, path)
			: template,
	);
}

function renderCallbackButtonTemplate(
	template: CallbackButtonTemplate,
	path: string,
): InlineKeyboardButton {
	const absolutePath = combinePath(path, template.relativePath);
	const absolutePathLength = Buffer.byteLength(absolutePath, 'utf8');
	if (absolutePathLength > 64) {
		throw new Error(
			`callback_data only supports 1-64 bytes. With this button (${template.relativePath}) it would get too long (${absolutePathLength}). Full path: ${absolutePath}`,
		);
	}

	return {
		text: template.text,
		callback_data: absolutePath,
	};
}
