import {strictEqual} from 'node:assert';
import {test} from 'node:test';
import {
	type Body,
	getBodyText,
	type InvoiceBody,
	isInvoiceBody,
	isLocationBody,
	isMediaBody,
	isTextBody,
	isVenueBody,
	type LocationBody,
	type MediaBody,
	type TextBody,
	type VenueBody,
} from './body.js';

function mehToString(something: unknown): string {
	if (typeof something === 'object' || !something) {
		return JSON.stringify(something);
	}

	return String(something);
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
];

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
	{
		text: 'Hello world!',
		entities: [
			{
				type: 'bold',
				offset: 0,
				length: 5,
			},
			{
				type: 'italic',
				offset: 6,
				length: 5,
			},
		],
	},
];

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
	{
		media: 'whatever',
		type: 'photo',
		text: 'Hello world!',
		entities: [
			{
				type: 'bold',
				offset: 0,
				length: 5,
			},
			{
				type: 'italic',
				offset: 6,
				length: 5,
			},
		],
	},
];

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
];

const EXAMPLE_VENUE: VenueBody = {
	venue: {
		location: {
			latitude: 50,
			longitude: 10,
		},
		title: 'A',
		address: 'B',
	},
};

const EXAMPLE_INVOICE: InvoiceBody = {
	invoice: {
		title: 'A',
		description: 'B',
		currency: 'EUR',
		payload: 'D',
		prices: [],
	},
};

async function macro(
	fn: (input: unknown) => boolean,
	works: readonly unknown[],
	wrongs: readonly unknown[],
): Promise<void> {
	await test(fn.name, async t => {
		await t.test('works', async t => {
			await Promise.all(
				works.map(async item =>
					t.test(mehToString(item), () => {
						strictEqual(fn(item), true);
					}),
				),
			);
		});
		await t.test('wrongs', async t => {
			await Promise.all(
				wrongs.map(async item =>
					t.test(mehToString(item), () => {
						strictEqual(fn(item), false);
					}),
				),
			);
		});
	});
}

await macro(isTextBody, EXAMPLE_TEXTS, [
	...EXAMPLE_WRONGS,
	...EXAMPLE_MEDIA,
	...EXAMPLE_LOCATION,
	EXAMPLE_VENUE,
	EXAMPLE_INVOICE,
]);

await macro(isMediaBody, EXAMPLE_MEDIA, [
	...EXAMPLE_WRONGS,
	...EXAMPLE_TEXTS,
	...EXAMPLE_LOCATION,
	EXAMPLE_VENUE,
	EXAMPLE_INVOICE,
]);

await macro(isLocationBody, EXAMPLE_LOCATION, [
	...EXAMPLE_WRONGS,
	...EXAMPLE_TEXTS,
	...EXAMPLE_MEDIA,
	EXAMPLE_VENUE,
	EXAMPLE_INVOICE,
]);

await macro(isVenueBody, [EXAMPLE_VENUE], [
	...EXAMPLE_WRONGS,
	...EXAMPLE_TEXTS,
	...EXAMPLE_MEDIA,
	...EXAMPLE_LOCATION,
	EXAMPLE_INVOICE,
]);

await macro(isInvoiceBody, [EXAMPLE_INVOICE], [
	...EXAMPLE_WRONGS,
	...EXAMPLE_TEXTS,
	...EXAMPLE_MEDIA,
	...EXAMPLE_LOCATION,
	EXAMPLE_VENUE,
]);

await test('getBodyText string', () => {
	const body: Body = 'foo';
	strictEqual(getBodyText(body), 'foo');
});

await test('getBodyText TextBody', () => {
	const body: Body = {
		text: 'foo',
	};
	strictEqual(getBodyText(body), 'foo');
});
