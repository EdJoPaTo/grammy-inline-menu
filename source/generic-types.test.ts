import {strictEqual} from 'node:assert';
import {test} from 'node:test';
import {hasTruthyKey, isObject, isRegExpExecArray} from './generic-types.ts';

await test('isRegExpExecArray true', async t => {
	const macro = async (regex: RegExp) =>
		t.test(regex.source, () => {
			strictEqual(isRegExpExecArray(regex.exec('bla')), true);
		});
	await macro(/bla/);
	await macro(/b(la)/);
});

await test('isRegExpExecArray null', async t => {
	const macro = async (title: string, input: unknown) =>
		t.test(title, () => {
			strictEqual(isRegExpExecArray(input), false);
		});
	await macro('null', null);
	await macro('regex', /bla/.exec('blubb'));
});

await test('isRegExpExecArray array without string entry', async t => {
	const macro = async (input: unknown) =>
		t.test(JSON.stringify(input), () => {
			strictEqual(isRegExpExecArray(input), false);
		});
	await macro([]);
	await macro([42]);
});

await test('isRegExpExecArray normal string array', async t => {
	const macro = async (input: unknown) =>
		t.test(JSON.stringify(input), () => {
			strictEqual(isRegExpExecArray(input), false);
		});
	await macro(['bla']);
	await macro(['bla', 'la']);
});

await test('isObject examples', async ctx => {
	const t = async (input: unknown) =>
		ctx.test(JSON.stringify(input), async () => {
			strictEqual(isObject(input), true);
		});
	const f = async (input: unknown) =>
		ctx.test(JSON.stringify(input), async () => {
			strictEqual(isObject(input), false);
		});

	await t({});
	await t(ctx);
	await f('bla');
	await f(() => 'bla');
	await f(5);
	await f(null);
	await f(true);
	await f(undefined);
});

await test('hasTruthyKey examples', async ctx => {
	const t = async (input: unknown) =>
		ctx.test(JSON.stringify(input), async () => {
			strictEqual(hasTruthyKey(input, 'stuff'), true);
		});
	const f = async (input: unknown) =>
		ctx.test(JSON.stringify(input), async () => {
			strictEqual(hasTruthyKey(input, 'stuff'), false);
		});
	await f(undefined);
	await f('undefined');
	await f([]);
	await f({});
	await f({stuffy: 'bla'});
	await t({stuff: 'bla'});
	await t({stuff: true});
	await f({stuff: false});
	await f({stuff: undefined});
	await f({stuff: null});
});
