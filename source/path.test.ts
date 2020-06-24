import test, {ExecutionContext} from 'ava'

import {RegExpLike} from './generic-types'

import {combinePath, combineTrigger, ensureTriggerChild, ensureRootMenuTrigger, ensureTriggerLastChild} from './path'

function combinePathMacro(t: ExecutionContext, parent: string, relativePath: string, expected: string): void {
	t.is(combinePath(parent, relativePath), expected)
}

combinePathMacro.title = (_title: string, parent: string, relativePath: string, expected: string) =>
	`combinePath(${parent}, ${relativePath}) is ${expected}`

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
	t.throws(() => combinePath('/whatever/', ''), {message: /empty string is not a relative path/})
})

test('ensureRootMenuTrigger does not throw on good trigger', t => {
	t.notThrows(() => ensureRootMenuTrigger(/^blubb\//))
})

test('ensureRootMenuTrigger throws when not ending with /', t => {
	t.throws(() => ensureRootMenuTrigger(/^blubb/), {message: /root menu trigger.+\//})
})

test('ensureRootMenuTrigger throws when not starting with ^/', t => {
	t.throws(() => ensureRootMenuTrigger(/blubb\//), {message: /root menu trigger.+\^/})
})

test('ensureRootMenuTrigger throws when it matches multiple slashes /', t => {
	t.throws(() => ensureRootMenuTrigger(/^.+\//), {message: /root menu trigger.+exactly one slash/})
})

function combineTriggerMacro(t: ExecutionContext, parent: RegExp, child: string | RegExpLike, expected: RegExp): void {
	t.deepEqual(combineTrigger(parent, child), expected)
}

combineTriggerMacro.title = (_title: string, parent: RegExp, child: string | RegExpLike, expected: RegExp) =>
	`combineTrigger ${String(parent)} with ${String(child)} is ${String(expected)}`

test(combineTriggerMacro, /^\//, 'foo', /^\/foo/)
test(combineTriggerMacro, /^\//, /foo/, /^\/foo/)
test(combineTriggerMacro, /^\//, /foo\//, /^\/foo\//)
test(combineTriggerMacro, /^\//, /[^/]+/, /^\/[^/]+/)

test(combineTriggerMacro, /^\//i, 'foo', /^\/foo/i)
test(combineTriggerMacro, /^\//i, /foo/, /^\/foo/i)

test('combineTrigger fails when not beginning with ^', t => {
	t.throws(() => combineTrigger(/\/whatever\//, /whatever/), {message: /begin from start/})
})

test('combineTrigger fails when parent is not ending with /', t => {
	t.throws(() => combineTrigger(/^\/whatever/, /whatever/), {message: /end with \//})
})

test('combineTrigger fails when child has flags/', t => {
	t.throws(() => combineTrigger(/^\/whatever\//, /whatever/i), {message: /flags/})
	t.throws(() => combineTrigger(/^\/whatever\//, {source: 'whatever', flags: 'i'}), {message: /flags/})
})

test('ensureTriggerLastChild throws when not ending with $', t => {
	t.throws(() => ensureTriggerLastChild(/blubb/))
	t.throws(() => ensureTriggerLastChild('blubb'))
	t.notThrows(() => ensureTriggerLastChild(/blubb$/))
	t.notThrows(() => ensureTriggerLastChild('blubb$'))
})

test('ensureTriggerChild throws when being somewhat relative', t => {
	t.throws(() => ensureTriggerChild(/..$/))
	t.throws(() => ensureTriggerChild('..$'))
	t.throws(() => ensureTriggerChild(/more than\/one deep$/))
	t.throws(() => ensureTriggerChild('more than/one deep$'))
	t.throws(() => ensureTriggerChild(/\/relative to root$/))
	t.throws(() => ensureTriggerChild('/relative to root$'))
})
