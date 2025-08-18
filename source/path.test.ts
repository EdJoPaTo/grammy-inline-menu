import {deepStrictEqual, strictEqual, throws} from 'node:assert';
import {test} from 'node:test';
import type {RegExpLike} from './generic-types.ts';
import {
	combinePath,
	combineTrigger,
	createRootMenuTrigger,
	ensurePathMenu,
	ensureTriggerChild,
	ensureTriggerLastChild,
	getMenuOfPath,
} from './path.ts';

await test('combinePath', async t => {
	const macro = async (
		parent: string,
		relativePath: string,
		expected: string,
	) =>
		t.test(`combinePath(${parent}, ${relativePath}) is ${expected}`, () => {
			strictEqual(combinePath(parent, relativePath), expected);
		});
	await macro('/', 'wow', '/wow');
	await macro('/', 'foo/bar', '/foo/bar');
	await macro('/foo/', 'bar', '/foo/bar');
	await macro('foo/', 'bar', 'foo/bar');
	await macro('/foo/', '/', '/');
	await macro('/foo/', '/bar', '/bar');
	await macro('/foo/', '..', '/');
	await macro('/foo/bar', '..', '/');
	await macro('/foo/bar/', '../..', '/');
	await macro('/foo/bar/stuff', '../..', '/');
	await macro('/foo/bar/stuff/', '../..', '/foo/');
	await macro('/foo/', '../bar', '/bar');
	await macro('/foo/', '.', '/foo/');
	await macro('/foo/bar', '.', '/foo/');
	await macro('/foo', 'bar', '/bar');
});

await test('combinePath fails on relative ./', () => {
	throws(() => combinePath('/whatever/', './'), {message: /\.\//});
});

await test('combinePath fails on empty relative', () => {
	throws(() => combinePath('/whatever/', ''), {
		message: /empty string is not a relative path/,
	});
});

await test('getMenuOfPath with already menu', () => {
	strictEqual(getMenuOfPath('/'), '/');
	strictEqual(getMenuOfPath('/foo/'), '/foo/');
	strictEqual(getMenuOfPath('/foo/bar/'), '/foo/bar/');
});

await test('getMenuOfPath with child', () => {
	strictEqual(getMenuOfPath('/foo'), '/');
	strictEqual(getMenuOfPath('/foo/bar'), '/foo/');
});

await test('getMenuOfPath throws when not a path', () => {
	throws(() => getMenuOfPath('foo'), {message: /not .+ a path/});
});

await test('createRootMenuTrigger does not throw on good trigger', async t => {
	const macro = async (trigger: string | RegExpLike) =>
		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		t.test(String(trigger), () => {
			createRootMenuTrigger(trigger);
		});
	await macro(/^blubb\//);
	await macro('blubb/');
	await macro(/^\//);
	await macro('/');
});

await test('createRootMenuTrigger throws when not ending with /', () => {
	throws(
		() => {
			createRootMenuTrigger(/^blubb/);
		},
		{message: /root menu trigger.+\//},
	);
});

await test('createRootMenuTrigger throws when not starting with ^', () => {
	throws(
		() => {
			createRootMenuTrigger(/blubb\//);
		},
		{message: /root menu trigger.+\^/},
	);
});

await test('createRootMenuTrigger throws when raw string contains multiple slashes /', () => {
	throws(
		() => {
			createRootMenuTrigger('some/stuff/');
		},
		{message: /root menu trigger.+exactly one slash/},
	);
});

await test('createRootMenuTrigger throws when it matches multiple slashes /', () => {
	throws(
		() => {
			createRootMenuTrigger(/^.+\//);
		},
		{message: /root menu trigger.+exactly one slash/},
	);
});

await test('combineTrigger', async t => {
	const macro = async (
		parent: RegExp,
		child: string | RegExpLike,
		expected: RegExp,
	) =>
		t.test(
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			`combineTrigger ${String(parent)} with ${String(child)} is ${
				String(expected)
			}`,
			() => {
				deepStrictEqual(combineTrigger(parent, child), expected);
			},
		);

	await macro(/^\//, 'foo', /^\/foo/);
	await macro(/^\//, /foo/, /^\/foo/);
	await macro(/^\//, /foo\//, /^\/foo\//);
	await macro(/^\//, /[^/]+/, /^\/[^/]+/);

	await macro(/^\//i, 'foo', /^\/foo/i);
	await macro(/^\//i, /foo/, /^\/foo/i);
});

await test('combineTrigger fails when not beginning with ^', () => {
	throws(() => combineTrigger(/\/whatever\//, /whatever/), {
		message: /begin from start/,
	});
});

await test('combineTrigger fails when parent is not ending with /', () => {
	throws(() => combineTrigger(/^\/whatever/, /whatever/), {
		message: /end with \//,
	});
});

await test('combineTrigger fails when child has flags/', async t => {
	const macro = async (child: string | RegExpLike) =>
		t.test(
			typeof child === 'string' ? child : `${child.source} ${child.flags}`,
			() => {
				throws(
					() => {
						combineTrigger(/^\/whatever\//, child);
					},
					{message: /flags/},
				);
			},
		);
	await macro(/whatever/i);
	await macro(/whatever/g);
	await macro(/whatever/gi);
	await macro({source: 'whatever', flags: 'i'});
});

await test('ensureTriggerLastChild throws when not ending with $', () => {
	throws(() => {
		ensureTriggerLastChild(/blubb/);
	});
	throws(() => {
		ensureTriggerLastChild('blubb');
	});
	ensureTriggerLastChild(/blubb$/);
	ensureTriggerLastChild('blubb$');
});

await test('ensureTriggerChild throws when being somewhat relative', async t => {
	const macro = async (trigger: string | RegExpLike) =>
		t.test(typeof trigger === 'string' ? trigger : trigger.source, () => {
			throws(() => {
				ensureTriggerChild(trigger);
			});
		});
	await macro(/..$/);
	await macro('..$');
	await macro(/more than\/one deep$/);
	await macro('more than/one deep$');
	await macro(/\/relative to root$/);
	await macro('/relative to root$');
});

await test('ensurePathMenu accepts correct paths', () => {
	ensurePathMenu('path/');
});

await test('ensurePathMenu throws when empty', () => {
	throws(
		() => {
			ensurePathMenu('');
		},
		{message: /empty string/},
	);
});

await test('ensurePathMenu throws when not ending with slash', () => {
	throws(
		() => {
			ensurePathMenu('path');
		},
		{message: /end with \//},
	);
});
