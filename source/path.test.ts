import test from 'ava'
import type {RegExpLike} from './generic-types.js'
import {
	combinePath,
	combineTrigger,
	createRootMenuTrigger,
	ensurePathMenu,
	ensureTriggerChild,
	ensureTriggerLastChild,
	getMenuOfPath,
} from './path.js'

const combinePathMacro = test.macro({
	exec(t, parent: string, relativePath: string, expected: string) {
		t.is(combinePath(parent, relativePath), expected)
	},
	title(
		_providedTitle,
		parent: string,
		relativePath: string,
		expected: string,
	) {
		return `combinePath(${parent}, ${relativePath}) is ${expected}`
	},
})

test(combinePathMacro, '/', 'wow', '/wow')
test(combinePathMacro, '/', 'foo/bar', '/foo/bar')
test(combinePathMacro, '/foo/', 'bar', '/foo/bar')
test(combinePathMacro, 'foo/', 'bar', 'foo/bar')
test(combinePathMacro, '/foo/', '/', '/')
test(combinePathMacro, '/foo/', '/bar', '/bar')
test(combinePathMacro, '/foo/', '..', '/')
test(combinePathMacro, '/foo/bar', '..', '/')
test(combinePathMacro, '/foo/bar/', '../..', '/')
test(combinePathMacro, '/foo/bar/stuff', '../..', '/')
test(combinePathMacro, '/foo/bar/stuff/', '../..', '/foo/')
test(combinePathMacro, '/foo/', '../bar', '/bar')
test(combinePathMacro, '/foo/', '.', '/foo/')
test(combinePathMacro, '/foo/bar', '.', '/foo/')
test(combinePathMacro, '/foo', 'bar', '/bar')

test('combinePath fails on relative ./', t => {
	t.throws(() => combinePath('/whatever/', './'), {message: /\.\//})
})

test('combinePath fails on empty relative', t => {
	t.throws(() => combinePath('/whatever/', ''), {
		message: /empty string is not a relative path/,
	})
})

test('getMenuOfPath with already menu', t => {
	t.is(getMenuOfPath('/'), '/')
	t.is(getMenuOfPath('/foo/'), '/foo/')
	t.is(getMenuOfPath('/foo/bar/'), '/foo/bar/')
})

test('getMenuOfPath with child', t => {
	t.is(getMenuOfPath('/foo'), '/')
	t.is(getMenuOfPath('/foo/bar'), '/foo/')
})

test('getMenuOfPath throws when not a path', t => {
	t.throws(() => getMenuOfPath('foo'), {message: /not .+ a path/})
})

test('createRootMenuTrigger does not throw on good trigger', t => {
	createRootMenuTrigger(/^blubb\//)
	t.pass()
})

test('createRootMenuTrigger throws when not ending with /', t => {
	t.throws(() => {
		createRootMenuTrigger(/^blubb/)
	}, {message: /root menu trigger.+\//})
})

test('createRootMenuTrigger throws when not starting with ^', t => {
	t.throws(() => {
		createRootMenuTrigger(/blubb\//)
	}, {message: /root menu trigger.+\^/})
})

test('createRootMenuTrigger throws when raw string contains multiple slashes /', t => {
	t.throws(() => {
		createRootMenuTrigger('some/stuff/')
	}, {message: /root menu trigger.+exactly one slash/})
})

test('createRootMenuTrigger throws when it matches multiple slashes /', t => {
	t.throws(() => {
		createRootMenuTrigger(/^.+\//)
	}, {message: /root menu trigger.+exactly one slash/})
})

const combineTriggerMacro = test.macro({
	exec(t, parent: RegExp, child: string | RegExpLike, expected: RegExp) {
		t.deepEqual(combineTrigger(parent, child), expected)
	},
	title(_providedTitle, parent, child, expected) {
		return `combineTrigger ${String(parent)} with ${String(child)} is ${String(expected)}`
	},
})

test(combineTriggerMacro, /^\//, 'foo', /^\/foo/)
test(combineTriggerMacro, /^\//, /foo/, /^\/foo/)
test(combineTriggerMacro, /^\//, /foo\//, /^\/foo\//)
test(combineTriggerMacro, /^\//, /[^/]+/, /^\/[^/]+/)

test(combineTriggerMacro, /^\//i, 'foo', /^\/foo/i)
test(combineTriggerMacro, /^\//i, /foo/, /^\/foo/i)

test('combineTrigger fails when not beginning with ^', t => {
	t.throws(() => combineTrigger(/\/whatever\//, /whatever/), {
		message: /begin from start/,
	})
})

test('combineTrigger fails when parent is not ending with /', t => {
	t.throws(() => combineTrigger(/^\/whatever/, /whatever/), {
		message: /end with \//,
	})
})

test('combineTrigger fails when child has flags/', t => {
	t.throws(() => combineTrigger(/^\/whatever\//, /whatever/i), {
		message: /flags/,
	})
	t.throws(
		() => combineTrigger(/^\/whatever\//, {source: 'whatever', flags: 'i'}),
		{message: /flags/},
	)
})

test('ensureTriggerLastChild throws when not ending with $', t => {
	t.throws(() => {
		ensureTriggerLastChild(/blubb/)
	})
	t.throws(() => {
		ensureTriggerLastChild('blubb')
	})
	ensureTriggerLastChild(/blubb$/)
	ensureTriggerLastChild('blubb$')
})

test('ensureTriggerChild throws when being somewhat relative', t => {
	t.throws(() => {
		ensureTriggerChild(/..$/)
	})
	t.throws(() => {
		ensureTriggerChild('..$')
	})
	t.throws(() => {
		ensureTriggerChild(/more than\/one deep$/)
	})
	t.throws(() => {
		ensureTriggerChild('more than/one deep$')
	})
	t.throws(() => {
		ensureTriggerChild(/\/relative to root$/)
	})
	t.throws(() => {
		ensureTriggerChild('/relative to root$')
	})
})

test('ensurePathMenu accepts correct paths', t => {
	ensurePathMenu('path/')
	t.pass()
})

test('ensurePathMenu throws when empty', t => {
	t.throws(() => {
		ensurePathMenu('')
	}, {message: /empty string/})
})

test('ensurePathMenu throws when not ending with slash', t => {
	t.throws(() => {
		ensurePathMenu('path')
	}, {message: /end with \//})
})
