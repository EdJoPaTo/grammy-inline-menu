import test from 'ava'

import {Body, TextBody, MediaBody, LocationBody, VenueBody, InvoiceBody, isTextBody, isMediaBody, isLocationBody, isVenueBody, isInvoiceBody, getBodyText} from './body.js'

function mehToString(something: unknown): string {
	if (typeof something === 'object' || !something) {
		return JSON.stringify(something)
	}

	return String(something)
}

// Fake JS user fails
const EXAMPLE_WRONGS: readonly unknown[] = [
	undefined,
	null,
	true,
	false,
	{},
	'',
	() => 'whatever',
	42,
	{
		media: 'whatever',
	},
	{
		media: 'whatever',
		type: 'whatever',
	},
	{
		location: {
			latitude: 50,
		},
	},
	{
		location: {
			latitude: 50,
			longitude: 10,
		},
		text: 'Locations cant have text',
	},
	{
		venue: {
			location: {
				latitude: 50,
				longitude: 10,
			},
			title: 'A',
			address: 'B',
		},
		text: 'Venue cant have text',
	},
	{
		venue: {
			location: {
				latitude: 50,
				longitude: 10,
			},
			title: 'Venue needs address',
		},
	},
	{
		venue: {
			location: {
				latitude: 50,
				longitude: 10,
			},
			address: 'Venue needs title',
		},
	},
	{
		venue: {
			location: {
				latitude: 50,
			},
			title: 'Venue needs valid location',
			address: 'B',
		},
	},
	{
		invoice: {
			title: 'A',
			description: 'B',
		},
		text: 'Invoice cant have text',
	},
]

const EXAMPLE_TEXTS: ReadonlyArray<string | TextBody> = [
	'Hello World',
	{
		text: 'Hello World',
	},
	{
		text: 'Hello World',
		parse_mode: 'Markdown',
	},
	{
		text: 'Hello World',
		disable_web_page_preview: true,
	},
]

const EXAMPLE_MEDIA: readonly MediaBody[] = [
	{
		media: 'whatever',
		type: 'photo',
	},
	{
		media: 'whatever',
		type: 'photo',
		text: 'whatever',
	},
	{
		media: 'whatever',
		type: 'photo',
		text: 'whatever',
		parse_mode: 'Markdown',
	},
]

const EXAMPLE_LOCATION: readonly LocationBody[] = [
	{
		location: {
			latitude: 50,
			longitude: 10,
		},
	},
	{
		location: {
			latitude: 50,
			longitude: 10,
		},
		live_period: 600,
	},
]

const EXAMPLE_VENUE: VenueBody = {
	venue: {
		location: {
			latitude: 50,
			longitude: 10,
		},
		title: 'A',
		address: 'B',
	},
}

const EXAMPLE_INVOICE: InvoiceBody = {
	invoice: {
		title: 'A',
		description: 'B',
		currency: 'EUR',
		payload: 'D',
		provider_token: 'E',
		prices: [],
	},
}

const isTextBodyMacro = test.macro({
	exec(t, expected: boolean, maybeBody: unknown) {
		t.is(isTextBody(maybeBody), expected)
	},
	title(_providedTitle, expected, maybeBody) {
		return `isTextBody ${String(expected)} ${mehToString(maybeBody)}`
	},
})

for (const body of EXAMPLE_TEXTS) {
	test(isTextBodyMacro, true, body)
}

for (const body of [...EXAMPLE_MEDIA, ...EXAMPLE_LOCATION, EXAMPLE_VENUE, EXAMPLE_INVOICE, ...EXAMPLE_WRONGS]) {
	test(isTextBodyMacro, false, body)
}

const isMediaBodyMacro = test.macro({
	exec(t, expected: boolean, maybeBody: unknown) {
		t.is(isMediaBody(maybeBody), expected)
	},
	title(_providedTitle, expected, maybeBody) {
		return `isMediaBody ${String(expected)} ${mehToString(maybeBody)}`
	},
})

for (const body of EXAMPLE_MEDIA) {
	test(isMediaBodyMacro, true, body)
}

for (const body of [...EXAMPLE_TEXTS, ...EXAMPLE_LOCATION, EXAMPLE_VENUE, EXAMPLE_INVOICE, ...EXAMPLE_WRONGS]) {
	test(isMediaBodyMacro, false, body)
}

const isLocationBodyMacro = test.macro({
	exec(t, expected: boolean, maybeBody: unknown) {
		t.is(isLocationBody(maybeBody), expected)
	},
	title(_providedTitle, expected, maybeBody) {
		return `isLocationBody ${String(expected)} ${mehToString(maybeBody)}`
	},
})

for (const body of EXAMPLE_LOCATION) {
	test(isLocationBodyMacro, true, body)
}

for (const body of [...EXAMPLE_TEXTS, ...EXAMPLE_MEDIA, EXAMPLE_VENUE, EXAMPLE_INVOICE, ...EXAMPLE_WRONGS]) {
	test(isLocationBodyMacro, false, body)
}

const isVenueBodyMacro = test.macro({
	exec(t, expected: boolean, maybeBody: unknown) {
		t.is(isVenueBody(maybeBody), expected)
	},
	title(_providedTitle, expected, maybeBody) {
		return `isVenueBody ${String(expected)} ${mehToString(maybeBody)}`
	},
})

for (const body of [EXAMPLE_VENUE]) {
	test(isVenueBodyMacro, true, body)
}

for (const body of [...EXAMPLE_TEXTS, ...EXAMPLE_MEDIA, ...EXAMPLE_LOCATION, ...EXAMPLE_WRONGS]) {
	test(isVenueBodyMacro, false, body)
}

const isInvoiceBodyMacro = test.macro({
	exec(t, expected: boolean, maybeBody: unknown) {
		t.is(isInvoiceBody(maybeBody), expected)
	},
	title(_providedTitle, expected, maybeBody) {
		return `isInvoiceBody ${String(expected)} ${mehToString(maybeBody)}`
	},
})

for (const body of [EXAMPLE_INVOICE]) {
	test(isInvoiceBodyMacro, true, body)
}

for (const body of [...EXAMPLE_TEXTS, ...EXAMPLE_MEDIA, ...EXAMPLE_LOCATION, EXAMPLE_VENUE, ...EXAMPLE_WRONGS]) {
	test(isInvoiceBodyMacro, false, body)
}

test('getBodyText string', t => {
	const body: Body = 'foo'
	t.is(getBodyText(body), 'foo')
})

test('getBodyText TextBody', t => {
	const body: Body = {
		text: 'foo',
	}
	t.is(getBodyText(body), 'foo')
})
