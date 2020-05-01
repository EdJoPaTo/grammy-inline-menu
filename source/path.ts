// Trigger are catching paths
// A menu is having a trigger. When a specific path is matching the trigger, the menu is opened.
// Example: The Trigger /\/events\/e-(.+)\/delete/ will get triggered when the path is called: /events/e-42/delete

import {RegExpLike} from './generic-types'

export function ensureTriggerChild(trigger: string | RegExpLike): void {
	const source = typeof trigger === 'string' ? trigger : trigger.source

	if (source.includes('/') || source.startsWith('..')) {
		throw new Error('actions are not relative. They have to be below the menu (dont contain / or ..)')
	}
}

export function ensureTriggerLastChild(trigger: string | RegExpLike): void {
	ensureTriggerChild(trigger)
	const source = typeof trigger === 'string' ? trigger : trigger.source

	if (!source.endsWith('$')) {
		throw new Error('actions are meant for buttons, the leaves of the menu tree. Regex ends with $: /button$/')
	}
}

export function combineTrigger(parent: RegExpLike, child: string | RegExpLike): RegExp {
	if (!parent.source.startsWith('^')) {
		throw new Error('the path has to begin from start in order to prevent mistakes: /^something…\\//')
	}

	if (!parent.source.endsWith('/')) {
		throw new Error('the path of the menu has to be supplied. Menu paths end with /')
	}

	if (typeof child !== 'string' && child.flags) {
		throw new Error('flags will not be merged')
	}

	return new RegExp(parent.source + (typeof child === 'string' ? child : child.source), parent.flags)
}

export function ensurePathMenu(path: string): void {
	if (!path.endsWith('/')) {
		throw new Error('the menu path always has to end with a slash: /')
	}
}

export function combinePath(parent: string, relativePath: string): string {
	if (relativePath.startsWith('./')) {
		throw new Error('the path can start without prefixing it with ./ When navigating to the current menu use an empty string or . (dot)')
	}

	if (relativePath.startsWith('/')) {
		return relativePath
	}

	const parentSegments = parent.split('/')

	if (relativePath.startsWith('..')) {
		let restOfRelative = relativePath.slice(2)
		if (restOfRelative.startsWith('/')) {
			restOfRelative = restOfRelative.slice(1)
		}

		const newParent = parentSegments.slice(0, -2).join('/') + '/'
		return combinePath(newParent, restOfRelative)
	}

	const newParent = parentSegments.slice(0, -1).join('/') + '/'

	if (relativePath === '.') {
		return newParent
	}

	return newParent + relativePath
}
