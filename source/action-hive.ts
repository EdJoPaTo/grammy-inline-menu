import type {
	ConstOrPromise,
	ContextPathFunc,
	RegExpLike,
} from './generic-types.js'
import {combineTrigger, ensureTriggerChild} from './path.js'

export type ActionFunc<Context> = (
	context: Context,
	path: string,
) => ConstOrPromise<string | boolean>

export type ButtonAction<Context> = {
	readonly trigger: RegExpLike;
	readonly doFunction: ActionFunc<Context>;
}

export class ActionHive<Context> {
	readonly #actions = new Set<ButtonAction<Context>>()

	add(
		trigger: RegExpLike,
		doFunction: ActionFunc<Context>,
		hide: undefined | ContextPathFunc<Context, boolean>,
	): void {
		ensureTriggerChild(trigger)

		const alreadyExisting = [...this.#actions]
			.map(o => o.trigger.source)
			.includes(trigger.source)
		if (alreadyExisting) {
			throw new Error(
				`The action "${
					trigger.source.slice(0, -1)
				}" you wanna add was already added. When you hit the button only the first one will be used and not both. This one can not be accessed then. Change the action code to something different.`,
			)
		}

		this.#actions.add({
			trigger,
			async doFunction(context, path) {
				if (await hide?.(context, path)) {
					return '.'
				}

				return doFunction(context, path)
			},
		})
	}

	list(path: RegExpLike): ReadonlySet<ButtonAction<Context>> {
		const result = new Set<ButtonAction<Context>>()
		for (const {trigger, doFunction} of this.#actions) {
			result.add({
				trigger: combineTrigger(path, trigger),
				doFunction,
			})
		}

		return result
	}
}
