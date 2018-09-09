# Telegraf Inline Menu

In order to build inline menus with Telegraf you need to handle `Markup.inlineKeyboard` and `bot.action` way to often.
Do this simple with this inline menu library.

## Example
```js
const menu = new TelegrafInlineMenu('main',
  ctx => `Hey ${ctx.from.first_name}!`
)
function toggle(ctx) {
  ctx.session.exited = !ctx.session.exited
}
menu.toggle('excited', 'Excited!', toggle)
```

# Documentation

This menu library is made to be as stateless as possible.
Restarting the bot will result in a still working bot.

All functions start with a actionCode:
```js
menu.toggle(actionCode, text, setFunc)
```
This actionCode is a unique identifier in the current menu and should stay the same as long as possible.
This ensures a smooth user experience as he can be anywhere in a menu and continue seemlessly after bot restarts.
As it will be used as `callback_data` it should be short in order to allow more data in it.

actionCodes will be concatinated in order to determine the exact location in the menu.
For Example `a:b:c` indicate the user is in menu `b` below menu `a` and used method `c`.

Other arguments of functions like `text` can be simple strings or functions.
When used as functions it will be called when the user accesses the menu.
This was used in the first line of the Example

## Methods

Methods generally support ES6 Promises as Parameters.
Optional arguments are possible in the object as the last parameter.

Methods often have these parameters:
- `actionCode`
  String or Function. Will be used as 'callback_data'.
- `text`
  String or Function that returns the text.
  Will be set as the button text.
- `setFunc`
  Will be called when the user selects an option from the menu
- `hide` (optional)
  Hides the button in the menu when the Function returns false

### `new TelegrafInlineMenu(actionCode, text, backButtonText, mainMenuButtonText)`

Creates a new Menu.

`actionCode` is the root actionCode.
Every actionCode generate my other Methods will be a child of this actionCode.
Example: When this is called with `a` and  `toggle('c', …)` is called the resulting actionCode for the toggle button will be `a:c`.

`test` is the text in the message itself.
This can be a `string` or `function(ctx)`.

`backButtonText` and `mainMenuButtonText` will be used for the back and top buttons.
Submenus will use these attibutes of parents.

### `menu.submenu(text, menu, {hide})`

Creates a Button in the menu to a submenu

This method is the only 'special' method as it does not start with 'actionCode'.
It uses the actionCode of the provided `menu`.
`text` can be a `string` or `function(ctx)`

`menu` is another TelegrafInlineMenu with an actionCode below the one of the current menu.
`hide(ctx)` (optional) can hide the button that opens the submenu.

### `menu.toggle(actionCode, text, setFunc, {isSetFunc, hide})`

Creates a button that toggles a setting

`actionCode` has to be unique in this menu.
`text` can be a `string` or a `function(ctx)` that will be set as the Button text.
`setFunc(ctx)` will be called when a user presses the toggle button.

`isSetFunc(ctx)` (optional) should return the current state of the toggle (true / false).
This will show an emoji to the user on the button as text prefix.
`hide(ctx)` (optional) can hide the button when return is true.

### `menu.select(actionCode, options, setFunc, {isSetFunc, prefixFunc, hide, columns})`

Creates multiple buttons for each provided option.

`actionCode` has to be unique in this menu.
`options` can be an string array or an object. (Or a function returning one of them)
The string array will use the value as Button text and as part of the `callback_data`.
When an object is proviced, key will be part of the `callback_data` while the value is used as Button Text.

`setFunc(ctx, key)` will be called when the user selects an entry.
`isSetFunc(ctx, key)` (optional) will be called in order to use this as an exclusive selection.
When true is returned the key will have an emoji indicating the current selection.
Can only be used when `prefixFunc` is not used.

`prefixFunc(ctx, key)` (optional) will be called to determine an individual prefix for each option.
Can only be used when `isSetFunc` is not used.

`hide(ctx, key)` (optional) can be used to hide some or all buttons in the menu when true is returned on the specific key.

`columns` (Integer, optional) can be provided in order to limit the amount of buttons in one row.

### `menu.list`

This is an alias for `menu.select`
The wording makes more sense with list that are not exclusive selections.
