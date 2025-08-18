import {deepStrictEqual, strictEqual} from 'node:assert';
import {test} from 'node:test';
import {MenuTemplate} from '../../source/menu-template.ts';

await test('menu-template body string body is passed through', async () => {
	const menu = new MenuTemplate('foobar');
	const body = await menu.renderBody(undefined, '/');
	strictEqual(body, 'foobar');
});

await test('menu-template body string function body is passed through', async () => {
	const menu = new MenuTemplate(() => 'foobar');
	const body = await menu.renderBody(undefined, '/');
	strictEqual(body, 'foobar');
});

await test('menu-template body complex body is passed through', async () => {
	const menu = new MenuTemplate({text: 'foobar', parse_mode: 'Markdown'});
	const body = await menu.renderBody(undefined, '/');
	deepStrictEqual(body, {text: 'foobar', parse_mode: 'Markdown'});
});
