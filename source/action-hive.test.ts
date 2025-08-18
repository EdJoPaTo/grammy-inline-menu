import {ok, strictEqual, throws} from 'node:assert';
import {test} from 'node:test';
import {type ActionFunc, ActionHive} from './action-hive.js';

await test('ActionHive add nothing is empty', () => {
	const a = new ActionHive();

	const result = a.list(/^foo\//);
	strictEqual(result.size, 0);
});

await test('ActionHive add simple doFunction', () => {
	const a = new ActionHive();

	const doFunction = (): never => {
		throw new Error('dont call the action function on list');
	};

	a.add(/bar$/, doFunction, undefined);

	const resultSet = a.list(/^foo\//);
	strictEqual(resultSet.size, 1);
	const result = [...resultSet][0]!;

	ok(new RegExp(result.trigger.source, result.trigger.flags).exec('foo/bar'));

	strictEqual(result.trigger.source, String.raw`^foo\/bar$`);
	strictEqual(result.trigger.flags, '');
});

await test('ActionHive doFunction without hide runs doFunction', async t => {
	const a = new ActionHive<string>();

	const doFunction = t.mock.fn<ActionFunc<string>>((context, path) => {
		strictEqual(context, 'bob');
		strictEqual(path, 'foo/bar');
		return 'wow';
	});

	a.add(/bar$/, doFunction, undefined);

	const resultSet = a.list(/^foo\//);
	const result = [...resultSet][0];

	const target = await result?.doFunction('bob', 'foo/bar');
	strictEqual(target, 'wow');
	strictEqual(doFunction.mock.callCount(), 1);
});

await test('ActionHive doFunction with hide false runs doFunction', async t => {
	const a = new ActionHive<string>();

	const doFunction = t.mock.fn<ActionFunc<string>>((context, path) => {
		strictEqual(context, 'bob');
		strictEqual(path, 'foo/bar');
		return 'wow';
	});

	a.add(/bar$/, doFunction, () => false);

	const resultSet = a.list(/^foo\//);
	const result = [...resultSet][0];

	const target = await result?.doFunction('bob', 'foo/bar');
	strictEqual(target, 'wow');
	strictEqual(doFunction.mock.callCount(), 1);
});

await test('ActionHive doFunction with hide true skips doFunction and returns update menu path .', async t => {
	const a = new ActionHive<string>();

	const doFunction = t.mock.fn<ActionFunc<string>>(() => {
		throw new Error('shouldnt be called');
	});

	a.add(/bar$/, doFunction, () => true);

	const resultSet = a.list(/^foo\//);
	const result = [...resultSet][0];

	const target = await result?.doFunction('bob', 'foo/bar');
	strictEqual(target, '.');
	strictEqual(doFunction.mock.callCount(), 0);
});

await test('ActionHive adding two times the same trigger throws', () => {
	const a = new ActionHive();

	const doFunction: ActionFunc<unknown> = () => {
		throw new Error('the do Function has not to be called');
	};

	a.add(/foo$/, doFunction, undefined);
	throws(
		() => {
			a.add(/foo$/, doFunction, undefined);
		},
		{
			message: /already added.+unique identifier/,
		},
	);
});
