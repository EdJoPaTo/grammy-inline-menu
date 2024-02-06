import type {ActionFunc} from '../action-hive.js';
import type {ContextPathFunc} from '../generic-types.js';

export interface BasicOptions<Context> {
	/**
	 * Return true when the button(s) should be hidden and not to be called
	 */
	readonly hide?: ContextPathFunc<Context, boolean>;
}

export interface SingleButtonOptions<Context> extends BasicOptions<Context> {
	/**
	 * Decide whether the button should be in the last added row or in a new row. Own row per default, last row when true.
	 */
	readonly joinLastRow?: boolean;
}

export interface InteractionOptions<Context>
	extends SingleButtonOptions<Context> {
	/**
	 * Function which is called when the button is pressed
	 */
	readonly do: ActionFunc<Context>;
}
