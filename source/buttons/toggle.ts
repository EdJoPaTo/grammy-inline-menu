import type {ConstOrPromise, ContextPathFunc} from '../generic-types.ts';
import type {CallbackButtonTemplate} from '../keyboard.ts';
import {prefixEmoji} from '../prefix.ts';
import type {SingleButtonOptions} from './basic.ts';

export type FormatStateFunction<Context> = (
	context: Context,
	text: string,
	state: boolean,
	path: string,
) => ConstOrPromise<string>;

export interface ToggleOptions<Context> extends SingleButtonOptions<Context> {
	/** Function returning the current state. */
	readonly isSet: ContextPathFunc<Context, boolean>;

	/** Function which is called when a user presses the button. */
	readonly set: (
		context: Context,
		newState: boolean,
		path: string,
	) => ConstOrPromise<string | boolean>;

	/** Format the button text which is visible to the user. */
	readonly formatState?: FormatStateFunction<Context>;
}

export function generateToggleButton<Context>(
	uniqueIdentifierPrefix: string,
	options: ToggleOptions<Context>,
): ContextPathFunc<Context, CallbackButtonTemplate | undefined> {
	const formatFunction: FormatStateFunction<Context> = options.formatState
		?? ((_, text, state) => prefixEmoji(text, state));
	return async (context, path) => {
		if (await options.hide?.(context, path)) {
			return undefined;
		}

		const textResult = typeof options.text === 'function'
			? await options.text(context, path)
			: options.text;
		const state = await options.isSet(context, path);

		const icon_custom_emoji_id
			= typeof options.icon_custom_emoji_id === 'function'
				? await options.icon_custom_emoji_id(context, path)
				: options.icon_custom_emoji_id;
		const style = typeof options.style === 'function'
			? await options.style(context, path)
			: options.style;

		return {
			text: await formatFunction(context, textResult, state, path),
			relativePath: uniqueIdentifierPrefix + ':' + (state ? 'false' : 'true'),
			...(icon_custom_emoji_id ? {icon_custom_emoji_id} : {}),
			...(style ? {style} : {}),
		};
	};
}
