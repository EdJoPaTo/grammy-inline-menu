import {combineTrigger, ensureTriggerChild} from './path'
import {ContextFunc, RegExpLike, ConstOrPromise} from './generic-types'

export type MenuAfterwardsTarget = void | string
export type ActionFunc<Context> = (context: Context, path: string) => ConstOrPromise<MenuAfterwardsTarget>

export interface ButtonAction<Context> {
	readonly trigger: RegExpLike;
	readonly doFunction: ActionFunc<Context>;
}

export class ActionHive<Context> {
	private readonly _actions: Set<ButtonAction<Context>> = new Set()

	add(trigger: RegExpLike, doFunction: ActionFunc<Context>, hide: undefined | ContextFunc<Context, boolean>): void {
		ensureTriggerChild(trigger)

		this._actions.add({
			trigger,
			doFunction: async (context, path) => {
				if (hide && await hide(context)) {
					return '.'
				}

				return doFunction(context, path)
			}
		})
	}

	list(path: RegExpLike): ReadonlySet<ButtonAction<Context>> {
		const result: Set<ButtonAction<Context>> = new Set()
		for (const {trigger, doFunction} of this._actions) {
			result.add({
				trigger: combineTrigger(path, trigger),
				doFunction
			})
		}

		return result
	}
}
