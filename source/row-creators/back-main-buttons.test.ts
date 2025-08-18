import {deepStrictEqual} from 'node:assert';
import {test} from 'node:test';
import {createBackMainMenuButtons} from './back-main-buttons.js';

await test('createBackMainMenuButtons creates no buttons in root menu', async () => {
	const func = createBackMainMenuButtons();
	const buttons = await func(undefined, '/');
	deepStrictEqual(buttons, [[]]);
});

await test('createBackMainMenuButtons creates no buttons in topmost menu', async () => {
	const func = createBackMainMenuButtons();
	const buttons = await func(undefined, 'foo/');
	deepStrictEqual(buttons, [[]]);
});

await test('createBackMainMenuButtons creates only main menu button when one deep', async () => {
	const func = createBackMainMenuButtons('back', 'main');
	const buttons = await func(undefined, '/foo/');
	deepStrictEqual(buttons, [
		[
			{
				text: 'main',
				relativePath: '/',
			},
		],
	]);
});

await test('createBackMainMenuButtons creates back button when when one deep but without main menu', async () => {
	const func = createBackMainMenuButtons('back', 'main');
	const buttons = await func(undefined, 'foo/bar/');
	deepStrictEqual(buttons, [
		[
			{
				text: 'back',
				relativePath: '..',
			},
		],
	]);
});

await test('createBackMainMenuButtons creates back and main button when when two deep', async () => {
	const func = createBackMainMenuButtons('back', 'main');
	const buttons = await func(undefined, '/foo/bar/');
	deepStrictEqual(buttons, [
		[
			{
				text: 'back',
				relativePath: '..',
			},
			{
				text: 'main',
				relativePath: '/',
			},
		],
	]);
});

await test('createBackMainMenuButtons creates only back button when when two deep but without main menu', async () => {
	const func = createBackMainMenuButtons('back', 'main');
	const buttons = await func(undefined, 'foo/bar/deep/');
	deepStrictEqual(buttons, [
		[
			{
				text: 'back',
				relativePath: '..',
			},
		],
	]);
});

await test('createBackMainMenuButtons creates button texts in function', async () => {
	const func = createBackMainMenuButtons(
		() => 'back',
		() => 'main',
	);
	const buttons = await func(undefined, '/foo/bar/');
	deepStrictEqual(buttons, [
		[
			{
				text: 'back',
				relativePath: '..',
			},
			{
				text: 'main',
				relativePath: '/',
			},
		],
	]);
});
