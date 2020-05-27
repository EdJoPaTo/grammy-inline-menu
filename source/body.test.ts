import test, {ExecutionContext} from 'ava'

import {Body, TextBody, MediaBody, isTextBody, isMediaBody, getBodyText, jsUserBodyHints} from './body'

function mehToString(something: any): string {
	if (typeof something === 'object' || !something) {
		return JSON.stringify(something)
	}

	return something.toString()
}

// Fake JS user fails
const EXAMPLE_WRONGS_RAW: readonly unknown[] = [
	undefined,
	null,
	true,
	false,
	{},
	() => 'whatever',
	42,
	{
		media: 'whatever'
	},
	{
		media: 'whatever',
		type: 'whatever'
	}
]
const EXAMPLE_WRONGS: readonly Body[] = EXAMPLE_WRONGS_RAW as any

const EXAMPLE_TEXTS: ReadonlyArray<string | TextBody> = [
	'Hello World',
	{
		text: 'Hello World'
	},
	{
		text: 'Hello World',
		parse_mode: 'Markdown'
	},
	{
		text: 'Hello World',
		disable_web_page_preview: true
	}
]

const EXAMPLE_MEDIA: readonly MediaBody[] = [
	{
		media: 'whatever',
		type: 'photo'
	},
	{
		media: 'whatever',
		type: 'photo',
		text: 'whatever'
	},
	{
		media: 'whatever',
		type: 'photo',
		text: 'whatever',
		parse_mode: 'Markdown'
	}
]

function isTextBodyMacro(t: ExecutionContext, expected: boolean, body: Body): void {
	t.is(isTextBody(body), expected)
}

isTextBodyMacro.title = (_title: string, expected: boolean, body: Body) => {
	return `isTextBody ${String(expected)} ${mehToString(body)}`
}

for (const body of EXAMPLE_TEXTS) {
	test(isTextBodyMacro, true, body)
}

for (const body of [...EXAMPLE_MEDIA, ...EXAMPLE_WRONGS]) {
	test(isTextBodyMacro, false, body)
}

function isMediaBodyMacro(t: ExecutionContext, expected: boolean, body: Body): void {
	t.is(isMediaBody(body), expected)
}

isMediaBodyMacro.title = (_title: string, expected: boolean, body: Body) => {
	return `isMediaBody ${String(expected)} ${mehToString(body)}`
}

for (const body of EXAMPLE_MEDIA) {
	test(isMediaBodyMacro, true, body)
}

for (const body of [...EXAMPLE_TEXTS, ...EXAMPLE_WRONGS]) {
	test(isMediaBodyMacro, false, body)
}

test('getBodyText string', t => {
	const body: Body = 'foo'
	t.is(getBodyText(body), 'foo')
})

test('getBodyText TextBody', t => {
	const body: Body = {
		text: 'foo'
	}
	t.is(getBodyText(body), 'foo')
})

for (const body of EXAMPLE_WRONGS) {
	test(`jsUserBodyHints fails with ${mehToString(body)}`, t => {
		t.throws(
			() => jsUserBodyHints(body),
			{instanceOf: TypeError}
		)
	})
}

for (const body of [...EXAMPLE_TEXTS, ...EXAMPLE_MEDIA]) {
	test(`jsUserBodyHints is fine with ${mehToString(body)}`, t => {
		t.notThrows(
			() => jsUserBodyHints(body)
		)
	})
}
