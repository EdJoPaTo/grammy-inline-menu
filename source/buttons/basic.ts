import type {ActionFunc} from '../action-hive.js';
import type {
	ConstOrContextPathFunc,
	ContextPathFunc,
} from '../generic-types.js';

export interface BasicOptions<Context> {
	/** Return true when the button(s) should be hidden and not to be called */
	readonly hide?: ContextPathFunc<Context, boolean>;
}

interface JoinLastRowOption {
	/** Decide whether the button should be in the last added row or in a new row. Own row per default, last row when true. */
	readonly joinLastRow?: boolean;
}

export interface SingleButtonOptions<Context>
	extends BasicOptions<Context>, JoinLastRowOption {
	/** Label text on the button */
	readonly text: ConstOrContextPathFunc<Context, string>;
}

export type ManualButtonOptions<Context> =
	& BasicOptions<Context>
	& JoinLastRowOption;

export interface UrlButtonOptions<Context>
	extends SingleButtonOptions<Context> {
	/** Url where this button should be heading */
	readonly url: ConstOrContextPathFunc<Context, string>;
}

export interface SwitchToChatOptions<Context>
	extends SingleButtonOptions<Context> {
	/** Query that is shown next to the bot username. Can be empty ('') */
	readonly query: ConstOrContextPathFunc<Context, string>;
}

export interface InteractionOptions<Context>
	extends SingleButtonOptions<Context> {
	/** Function which is called when the button is pressed */
	readonly do: ActionFunc<Context>;
}
