# Telegraf Inline Menu

[![NPM Version](https://img.shields.io/npm/v/telegraf-inline-menu.svg)](https://www.npmjs.com/package/telegraf-inline-menu)
[![node](https://img.shields.io/node/v/telegraf-inline-menu.svg)](https://www.npmjs.com/package/telegraf-inline-menu)
[![Build Status](https://travis-ci.org/EdJoPaTo/telegraf-inline-menu.svg?branch=master)](https://travis-ci.org/EdJoPaTo/telegraf-inline-menu)
[![Dependency Status](https://david-dm.org/EdJoPaTo/telegraf-inline-menu/status.svg)](https://david-dm.org/EdJoPaTo/telegraf-inline-menu)
[![Peer Dependency Status](https://david-dm.org/EdJoPaTo/telegraf-inline-menu/peer-status.svg)](https://david-dm.org/EdJoPaTo/telegraf-inline-menu?type=peer)
[![Dev Dependency Status](https://david-dm.org/EdJoPaTo/telegraf-inline-menu/dev-status.svg)](https://david-dm.org/EdJoPaTo/telegraf-inline-menu?type=dev)

This menu library is made to easily create an inline menu for your Telegram bot.

![Example Food Menu](media/example-food.gif)

# Installation

```
$ npm install telegraf-inline-menu
```

or using `yarn`:

```
$ yarn add telegraf-inline-menu
```

# Examples

## Basic Example

```js
const Telegraf = require('telegraf')
const TelegrafInlineMenu = require('telegraf-inline-menu')

const menu = new TelegrafInlineMenu(ctx => `Hey ${ctx.from.first_name}!`)
menu.setCommand('start')

menu.simpleButton('I am excited!', 'a', {
  doFunc: ctx => ctx.reply('As am I!')
})


const bot = new Telegraf(process.env.BOT_TOKEN)

bot.use(menu.init())

bot.startPolling()
```

## More interesting one

Look at the code here :  [example.ts](example.ts) / [example.js](example.js)

![Example Food Menu](media/example-food.gif)

# Documentation

The menu function arguments start with the text of the resulting button:

```js
menu.simpleButton(text, action, {
  doFunc
})
```

The second argument is the action.
This has to be an unique identifier in the current menu.
It is used to determine the pressed button.
Keep the action the same as long as possible over updates of the bot to ensure a smooth user experience as the user can continue seemlessly after bot restarts or updates.
As it will be used as a part in the `callback_data` it should be short in order to allow more data in it.

Arguments in most functions like `text` can be a simple string or a function / Promise.
When used as functions it will be called when the user accesses the menu.
This was used in the first line of the example to return the user `first_name`.

As this is based on Telegraf see their [Docs](https://telegraf.js.org/) or [GitHub Repo](https://github.com/telegraf/telegraf).
Also see the Telegram [Bot API Documentation](https://core.telegram.org/bots/api).

## Action Code

The Action Code identifies the specific button within the whole bot.
It has to stay unique in order to know what specific button was pressed by the user.

When using Telegraf for a callbackButton you would write something like this:
```js
bot.command('start', ctx => ctx.reply('Hi!', Markup.inlineKeyboard([
  Markup.callbackButton('text', 'my-callback-data')
])))

bot.action('my-callback-data', ctx => ctx.answerCbQuery(''))
```

This library does the same for you.
The `callback_data` is generated from the `action` parameters you supply.
For example the following menu example will use `foo:bar:something` as `callback_data` for the `simpleButton`.

```js
const mainMenu = new TelegrafInlineMenu('Main Menu')
const fooMenu = new TelegrafInlineMenu('Foo Menu')
const barMenu = new TelegrafInlineMenu('Bar Menu')

mainMenu.submenu('Open Foo Menu', 'foo', fooMenu)
fooMenu.submenu('Open Bar Menu', 'bar', barMenu)
barMenu.simpleButton('Hit me', 'something', {…})

const bot = new Telegraf()
bot.use(mainMenu.init())
```

Make sure the `action` argument is not too long.
The current length of the `callback_data` can be [up to 64 bytes](https://core.telegram.org/bots/api#inlinekeyboardbutton).
Especially take care of menu parts with dynamic content like `menu.select` or `menu.selectSubmenu` which tends to longer keys.

(Advanced Usage:) Maybe you noted by now that the main menu has no action in the above example.
The root menu actionCode can be set with `menu.init({actionCode: 'beep'})` and defaults to `main`.
See `menu.init` docs for this.
In order to save 5 bytes in the `callback_data` `main:` is ommited.

## Methods

Methods generally support ES6 Promises as Parameters.

Methods often have these parameters:

- `text` (String / Function / Promise)
  String or Function that returns the text.
  Will be set as the button text.
- `action` (String)
  Will be used as 'callback_data'.
- `hide` (optional, Function)
  Hides the button in the menu when the Function returns true
- `joinLastRow` (optional, Boolean)
  When set to true the button will try to join the row before. Useful in order to create buttons side by side.

### `const menu = new TelegrafInlineMenu(text, {photo})`

Creates a new Menu.

Example: When this is called with `a` and `toggle('c', …)` is called the resulting actionCode for the toggle button will be `a:c`.

`text` is the text in the message itself.
This can be a `string` or `function(ctx)`.

`photo` is an identifier for a photo.
See [Telegraf Documentation: Working with files](https://telegraf.js.org/#/?id=working-with-files).
Can be the identifier as a constant or a function returning it.

### `bot.use(menu.init({backButtonText, mainMenuButtonText, actionCode}))`

This is used to apply the menu to the bot.
Should be one the last things before using `bot.startPolling()`

#### Arguments

`backButtonText` and `mainMenuButtonText` (both optional) will be used for the back and top buttons.

`actionCode` (optional, for advanced use only)
When multiple menus that are not submenus of each other are created this is used to define the root actionCode of the current menu. As action codes have to be unique there as to be an own action code for each menu. When this is not given, 'main' is assumed.

### `menu.setCommand(command)`

This used to entry the current menu by a bot command.
Normally you would do something like `bot.command('start', …)` in order to get a command.
This is different as it has to do some extra steps internally.

Each submenu can have its own commands. For example this is useful with a main menu (/start) and a settings submenu (/settings):

```js
const main = new TelegrafInlineMenu('Main')
main.setCommand('start')
const settings = new TelegrafInlineMenu('Settings')
settings.setCommand('settings')
main.submenu('Settings', 's', settings)
```

### `menu.button(text, action, {doFunc, hide, joinLastRow, setParentMenuAfter})`

Button for triggering functions.
Updates menu when `doFunc()` finished.

When your `doFunc` does not update things in the menu use `menu.simpleButton` instead.
It has the exact same arguments and will not update the menu after the `doFunc()`.

#### Arguments

`text` can be a `string` or a `function(ctx)` that will be set as the Button text.

`action` has to be unique in this menu.

`doFunc(ctx)` will be triggered when user presses the button.

`hide(ctx)` (optional) can hide the button when return is true.

`setParentMenuAfter` (optional) can be set to true in order to open the parent menu instead of the current menu after the doFunc was executed.

### `menu.simpleButton(text, action, {doFunc, hide, joinLastRow})`

see `menu.button`

### `menu.pagination(action, {setPage, getCurrentPage, getTotalPages, hide, setParentMenuAfter})`

Adds a pagination row. The user can select the page he wants to see relative to the current page.

Pages are 1 based. The first page is 1.
The currentPage has to be within [1..totalPages]

#### Arguments

`action` has to be unique in this menu.

`setPage(ctx, page)` is called when the user presses a page button. Adapt your content based on this selected page.

`getCurrentPage(ctx)` has to return the currently selected page.

`getTotalPages(ctx)` has to return all the available pages.

### `menu.question(buttonText, action, {uniqueIdentifier, questionText, setFunc, hide, joinLastRow})`

When the user presses the button, he will be asked a question.
The answer he gives is available via `setFunc(ctx, answer)`
When the user answers with something that is not a text (a photo for example) `answer` will be undefined.
`ctx.message` contains the full answer.

#### Arguments

`buttonText` can be a `string` or a `function(ctx)` that will be set as the Button text.

`action` has to be unique in this menu.

`setFunc(ctx, answer)` will be called when the user answers the question.

`uniqueIdentifier` needs to be a globally unique string which identifies this question.

`questionText` can be a `string` or a `function(ctx)` that will be set as the Question text.

`hide(ctx)` (optional) can hide the button when return is true.

### `menu.select(action, options, {setFunc, isSetFunc, prefixFunc, textFunc, hide, columns, maxRows, setPage, getCurrentPage, setParentMenuAfter})`

Creates multiple buttons for each provided option.

#### Arguments

`action` has to be unique in this menu.

`options` can be an string array or an object. (Or a function returning one of them)
The string array will use the value as Button text and as part of the `callback_data`.
The option as an object has to be in the following format:
`{key1: buttonText, key2: buttonText, …}`

`setFunc(ctx, key)` will be called when the user selects an entry.

`isSetFunc(ctx, key)` (optional) will be called in order to use this as an exclusive selection.
When true is returned the key will have an emoji indicating the current selection.
When `multiselect` is set all entries will have an emoji as they are true or false.
When `isSetFunc` returns something different than true or false, it will be the prefix instead.
Can only be used when `prefixFunc` is not used.

`prefixFunc(ctx, key)` (optional) will be called to determine an individual prefix for each option.
Can only be used when `isSetFunc` is not used.

`textFunc(ctx, key)` (optional) will be called to determine the text of the given key.
When `options` is an object this text will override the options.
When not given the key itself is assumed to be the text.

`multiselect` (optional)
see `isSetFunc`

`hide(ctx, key)` (optional) can be used to hide the button with the given key in the menu when true is returned.

`columns` (Integer, optional) can be provided in order to limit the amount of buttons in one row. (default: 6)

`maxRows` (Integer, optional) can be provided to limit the maximal rows of buttons. (default: 10)

`setPage(ctx, page)` and `getCurrentPage(ctx)` enables pagination for the given options.
See `menu.pagination()` for that.

`setParentMenuAfter` (optional) can be set to true in order to open the parent menu instead of the current menu after the setFunc was executed.
Only has an effect when `setFunc` is used.

### `menu.selectSubmenu(action, options, submenu, {isSetFunc, prefixFunc, textFunc, hide, columns, maxRows, setPage, getCurrentPage})`

Creates multiple buttons for each provided option.
When hitting the option the submenu is opened.
Needed information can be found in `ctx.match`.

#### Arguments

the same as `menu.select()` except:

`hide(ctx)` (optional) can be used to hide the complete selection when true is returned.

### `menu.toggle(text, action, {setFunc, isSetFunc, hide, joinLastRow})`

Creates a button that toggles a setting.

#### Arguments

`text` can be a `string` or a `function(ctx)` that will be set as the Button text.

`action` has to be unique in this menu.

`setFunc(ctx, newState)` will be called when a user presses the toggle button.
`newState` contains the new State (true / false).

`isSetFunc(ctx)` has to return the current state of the toggle (true / false).
This will show an emoji to the user on the button as text prefix.

`hide(ctx)` (optional) can hide the button when return is true.

### `menu.submenu(text, action, submenu, {hide, joinLastRow})`

Creates a Button in the menu to a submenu

#### Arguments

`text` can be a `string` or `function(ctx)`

`action` has to be a `string` / `RegExp`

`menu` is another TelegrafInlineMenu.
`hide(ctx)` (optional) can hide the button that opens the submenu.

#### Usage

As methods return the current menu you can concat button methods like that:

```js
const menu = new TelegrafInlineMenu('test')
menu
  .manual('Test 1', 'a')
  .manual('Test 2', 'b')
```

With submenus this is different in order to create simple submenus.
As it returns the submenu instead methods attached to the .submenu are added to the submenu instead.
In the following example the Test1 & 2 buttons are inside the submenu. Test3 button is in the upper menu.

```js
const menu = new TelegrafInlineMenu('test')
menu
  .submenu('Submenu', 's', new TelegrafInlineMenu('Fancy Submenu'))
  .manual('Test1', 'a')
  .manual('Test2', 'b')

menu.manual('Test3', 'z')
```

### `menu.manual(text, action, {hide, joinLastRow, root})`

Add a Button for a manual (or legacy) `bot.action`.

You have to do `bot.action` yourself with the corresponding actionCode.
`root` can be useful.

#### Arguments

`text` can be a `string` or a `function(ctx)` that will be set as the Button text.

`action` has to be unique in this menu.

`hide(ctx)` (optional) can hide the button when return is true.

`root` (optional) can be `true` or `false`.
When `true` the action is not relative to the menu and will be 'global'.
This is useful for links to other menus.

### `menu.urlButton(text, url, {hide, joinLastRow})`

Url button. This button is just a pass through and has no effect on the actionCode system.

#### Arguments

`text` and `url` can be `string` or `function(ctx)`.

`hide(ctx)` (optional) can hide the button when return is true.

### `menu.switchToChatButton(text, value, {hide, joinLastRow})`

Switch button. This button is just a pass through and doesn't have an effect on the actionCode system.

#### Arguments

`text` and `value` can be `string` or `function(ctx)`.

`hide(ctx)` (optional) can hide the button when return is true.

### `menu.switchToCurrentChatButton(text, value, {hide, joinLastRow})`

see `menu.switchToChatButton`

### `const middleware = menu.replyMenuMiddleware()`

Generate a middleware that can be used when the menu shall be send manually.
For example when the menu should be changed on external events.
Also the menu can be manually changed via a simleButton based on external information.

#### Usage

When the menu is always the same you can use the simple variant like other middlewares:

```js
bot.command('test', menu.replyMenuMiddleware())
```

Hint: `menu.replyMenuMiddleware()` has to be called before .init() in order to work

When the menu can have different config based to upper menus (like select -> submenu) you need to provide the exact actionCode that shall be opened.
This is something only recommended for expert users as it requires quite a bit understanding of the internal logic.

For example you have an detail menu for a specific product, so do did something like that:

```js
const main = new TelegrafInlineMenu('foo')
const submenu = new TelegrafInlineMenu('details for …')
main.select('details', ['a', 'b'], {
  submenu: submenu
})
```

When you now want to point from somewhere else to the specific submenu you can either use .manual(…) or or the `replyMenuMiddleware`.
Lets assume you want to open the details of b.
As the menu is below the main menu, the resulting ActionCode here is 'details-b'.

With manual you would use a root action:

```js
menu.manual('Open details of b', 'details-b', {root: true})
```

With replyMenuMiddleware this is more complex (and still only recommended for expert users):

```js
const main = new TelegrafInlineMenu('foo')
const submenu = new TelegrafInlineMenu('details for …')
const replyMiddleware = submenu.replyMenuMiddleware()
main.select('details', ['a', 'b'], {
  submenu: submenu
})

main.simpleButton('Open details for b', 'z', {
  doFunc: ctx => replyMiddleware.setSpecific(ctx, 'details-b')
})
```
