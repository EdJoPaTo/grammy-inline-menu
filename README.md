# grammY Inline Menu

This menu library is made to easily create an inline menu for your Telegram bot.

![Example shown as a GIF](media/example-food.gif)

## Installation

```bash
npm install grammy grammy-inline-menu
```

Consider using TypeScript with this library as it helps with finding some common mistakes faster.

A good starting point for TypeScript and Telegram bots might be this repo: [EdJoPaTo/telegram-typescript-bot-template](https://github.com/EdJoPaTo/telegram-typescript-bot-template)

## Examples

### Basic Example

```ts
import { Bot } from "grammy";
import { MenuMiddleware, MenuTemplate } from "grammy-inline-menu";

const menuTemplate = new MenuTemplate<MyContext>((ctx) =>
	`Hey ${ctx.from.first_name}!`
);

menuTemplate.interact("unique", {
	text: "I am excited!",
	do: async (ctx) => {
		await ctx.reply("As am I!");
		return false;
	},
});

const bot = new Bot(process.env.BOT_TOKEN);

const menuMiddleware = new MenuMiddleware("/", menuTemplate);
bot.command("start", (ctx) => menuMiddleware.replyToContext(ctx));
bot.use(menuMiddleware);

await bot.start();
```

### More interesting one

![Example shown as a GIF](media/example-food.gif)

Look at the [TypeScript code here](examples/main.ts).

## Version migration

### Migrate from version 6 to 7

Version 7 switches from Telegraf to [grammY](https://github.com/grammyjs/grammY) as a Telegram Bot framework.
grammY has various benefits over Telegraf as Telegraf is quite old and grammY learned a lot from its mistakes and shortcomings.

```diff
-import {Telegraf} from 'telegraf'
-import {MenuTemplate, MenuMiddleware} from 'telegraf-inline-menu'
+import {Bot} from 'grammy'
+import {MenuTemplate, MenuMiddleware} from 'grammy-inline-menu'
```

### Migrate from version 8 to 9

Version 9 moves `MenuTemplate` arguments into the options object.
This results in shorter lines and easier code readability.
It also allows to inline methods easier.

```diff
-menuTemplate.interact((ctx) => ctx.i18n.t('button'), 'unique', {
+menuTemplate.interact('unique', {
+  text: (ctx) => ctx.i18n.t('button'),
   do: async (ctx) => {
     …
   }
}
```

```diff
-menuTemplate.url('Text', 'https://edjopato.de', { joinLastRow: true });
+menuTemplate.url({ text: 'Text', url: 'https://edjopato.de', joinLastRow: true });
```

```diff
-menuTemplate.choose('unique', ['walk', 'swim'], {
+menuTemplate.choose('unique', {
+  choices: ['walk', 'swim'],
   do: async (ctx, key) => {
     …
	 }
 }
```

## How does it work

Telegrams inline keyboards have buttons.
These buttons have a text and callback data.

When a button is hit, the callback data is sent to the bot.
You know this from grammY as `bot.callbackQuery`.

This library both creates the buttons and listens for callback data events.
When a button is pressed and its callback data is occurring the function relevant to the button is executed.

In order to handle tree like menu structures with submenus the buttons itself use a tree like structure to differentiate between the buttons.
Imagine it as the file structure on a PC.

The main menu uses `/` as callback data.
A button in the main menu will use `/my-button` as callback data.
When you create a submenu it will end with a `/` again: `/my-submenu/`.

This way the library knows what do to when an action occurs:
If the callback data ends with a `/` it will show the corresponding menu.
If it does not end with a `/` it is an interaction to be executed.

You can use a middleware in order to see which callback data is used when you hit a button:

```ts
bot.use((ctx, next) => {
	if (ctx.callbackQuery) {
		console.log("callback data just happened", ctx.callbackQuery.data);
	}

	return next();
});

bot.use(menuMiddleware);
```

You can also take a look on all the regular expressions the menu middleware is using to notice a button click with `console.log(menuMiddleware.tree())`.
Don't be scared by the output and try to find where you can find the structure in the source code.
When you hit a button, the specific callback data will be matched by one of the regular expressions.
Also try to create a new button and find it within the tree.

If you want to manually send your submenu `/my-submenu/` you have to supply the same path that is used when you press the button in the menu.

### Improve the docs

If you have any questions on how the library works head out to the issues and ask ahead.
You can also join the [grammY community chat](https://t.me/grammyjs) in order to talk about the questions on your mind.

When you think there is something to improve on this explanation, feel free to open a Pull Request!
I am already stuck in my bubble on how this is working.
You are the expert on getting the knowledge about this library.
Let's improve things together!

## FAQ

### Can I use HTML / MarkdownV2 in the message body?

Maybe this is also useful: [NPM package telegram-format](https://github.com/EdJoPaTo/telegram-format)

```ts
const menuTemplate = new MenuTemplate<MyContext>((ctx) => {
	const text = "<i>Hey</i> <b>there</b>!";
	return { text, parse_mode: "HTML" };
});
```

### Can I use `entities` in the message body?

Also see: [`grammyjs/parse-mode`](https://github.com/grammyjs/parse-mode)

```ts
import { bold, fmt, underline } from "@grammyjs/parse-mode";

const menu = new MenuTemplate<MyContext>(async () => {
	const message = fmt`${bold(underline("Hello world!"))}`;
	return {
		text: message.text,
		entities: message.entities,
	};
});
```

### Can the menu body be some media?

The menu body can be an object containing `media` and `type` for media.
The `media` and `type` is the same as [Telegrams `InputMedia`](https://core.telegram.org/bots/api#inputmedia).
The media is just passed to grammY so check its documentation on [how to work with files](https://grammy.dev/guide/files.html).

The [example](examples/main.ts) features a media submenu with all currently supported media types.

```ts
const menuTemplate = new MenuTemplate<MyContext>((ctx, path) => {
	// Do something

	return {
		type: "photo",
		media: {
			source: `./${ctx.from.id}.jpg`,
		},
		text: "Some *caption*",
		parse_mode: "Markdown",
	};
});
```

The argument of the `MenuTemplate` can be passed a body or a function returning a body.
A body can be a string or an object with options like seen above.
When using as a function the arguments are the context and the path of the menu when called.

### How can I run a simple method when pressing a button?

```ts
menuTemplate.interact("unique", {
	text: "Text",
	do: async (ctx) => {
		await ctx.answerCallbackQuery("yaay");
		return false;
	},
});
```

### Why do I have to return a boolean or string for the do/set function?

You can control if you want to update the menu afterwards or not.
When the user presses a button which changes something in the menu text, you want the user to see the updated content.
You can return a relative path to go to afterwards or a simple boolean (yes = `true`, no = `false`).

Using paths can become super handy.
For example when you want to return to the parent menu you can use the path `..`.
Or to a sibling menu with `../sibling`.

If you just want to navigate without doing logic, you should prefer `.navigate(…)`.

```ts
menuTemplate.interact("unique", {
	text: "Text",
	do: async (ctx) => {
		await ctx.answerCallbackQuery("go to parent menu after doing some logic");
		return "..";
	},
});
```

### How to use a dynamic text of a button?

This is often required when translating ([i18n](https://grammy.dev/plugins/i18n.html)) your bot.

Also check out other buttons like [toggle](#how-can-i-toggle-a-value-easily) as they do some formatting of the button text for you.

```ts
menuTemplate.interact("unique", {
	text: (ctx) => ctx.i18n.t("button"),
	do: async (ctx) => {
		await ctx.answerCallbackQuery(ctx.i18n.t("reponse"));
		return ".";
	},
});
```

### How can I show a URL button?

```ts
menuTemplate.url({ text: "Text", url: "https://edjopato.de" });
```

### How can I display two buttons in the same row?

Use `joinLastRow` in the second button

```ts
menuTemplate.interact("unique", {
	text: "First",
	do: async (ctx) => {
		await ctx.answerCallbackQuery("yaay");
		return false;
	},
});

menuTemplate.interact("unique", {
	joinLastRow: true,
	text: "Second",
	do: async (ctx) => {
		await ctx.answerCallbackQuery("yaay");
		return false;
	},
});
```

### How can I toggle a value easily?

```ts
menuTemplate.toggle("unique", {
	text: "Text",
	isSet: (ctx) => ctx.session.isFunny,
	set: (ctx, newState) => {
		ctx.session.isFunny = newState;
		return true;
	},
});
```

### How can I select one of many values?

```ts
menuTemplate.select("unique", {
	choices: ["human", "bird"],
	isSet: (ctx, key) => ctx.session.choice === key,
	set: (ctx, key) => {
		ctx.session.choice = key;
		return true;
	},
});
```

### How can I toggle many values?

```ts
menuTemplate.select("unique", {
	showFalseEmoji: true,
	choices: ["has arms", "has legs", "has eyes", "has wings"],
	isSet: (ctx, key) => Boolean(ctx.session.bodyparts[key]),
	set: (ctx, key, newState) => {
		ctx.session.bodyparts[key] = newState;
		return true;
	},
});
```

### How can I interact with many values based on the pressed button?

```ts
menuTemplate.choose("unique", {
	choices: ["walk", "swim"],
	do: async (ctx, key) => {
		await ctx.answerCallbackQuery(`Lets ${key}`);
		// You can also go back to the parent menu afterwards for some 'quick' interactions in submenus
		return "..";
	},
});
```

### What's the difference between choose and select?

If you want to do something based on the choice, use `menuTemplate.choose(…)`.
If you want to change the state of something, select one out of many options for example, use `menuTemplate.select(…)`.

`menuTemplate.select(…)` automatically updates the menu on pressing the button and shows what it currently selected.
`menuTemplate.choose(…)` runs the method you want to run.

### How can I use dynamic text for many values with choose or select?

One way of doing so is via `Record<string, string>` as input for the choices:

```ts
const choices: Record<string, string> = {
	a: 'Alphabet',
	b: 'Beta',
	c: 'Canada'
}

menuTemplate.choose('unique', {choices, …})
```

You can also use the `buttonText` function for `.choose(…)` or `formatState` for `.select(…)` (and `.toggle(…)`)

```ts
menuTemplate.choose('unique', {
	choices: ['a', 'b'],
	do: …,
	buttonText: (context, text) => {
		return text.toUpperCase()
	}
})
```

### I have too much content for one message. Can I use a pagination?

`menuTemplate.pagination` is basically a glorified `choose`.
You can supply the amount of pages you have and what's your current page is, and it tells you which page the user what's to see.
Splitting your content into pages is still your job to do.
This allows you for all kinds of variations on your side.

```ts
menuTemplate.pagination("unique", {
	getTotalPages: () => 42,
	getCurrentPage: (context) => context.session.page,
	setPage: (context, page) => {
		context.session.page = page;
	},
});
```

### My choose/select has too many choices. Can I use a pagination?

When you don't use a pagination, you might have noticed that not all of your choices are displayed.
Per default only the first page is shown.
You can select the amount of rows and columns via `maxRows` and `columns`.
The pagination works similar to `menuTemplate.pagination`, but you do not need to supply the amount of total pages as this is calculated from your choices.

```ts
menuTemplate.choose('eat', {
	columns: 1,
	maxRows: 2,
	choices: ['cheese', 'bread', 'salad', 'tree', …],
	getCurrentPage: context => context.session.page,
	setPage: (context, page) => {
		context.session.page = page
	}
})
```

### How can I use a submenu?

```ts
const submenuTemplate = new MenuTemplate<MyContext>("I am a submenu");
submenuTemplate.interact("unique", {
	text: "Text",
	do: async (ctx) => ctx.answerCallbackQuery("You hit a button in a submenu"),
});
submenuTemplate.manualRow(createBackMainMenuButtons());

menuTemplate.submenu("unique", submenuTemplate, { text: "Text" });
```

### How can I use a submenu with many choices?

```ts
const submenuTemplate = new MenuTemplate<MyContext>((ctx) =>
	`You chose city ${ctx.match[1]}`
);
submenuTemplate.interact("unique", {
	text: "Text",
	do: async (ctx) => {
		console.log(
			"Take a look at ctx.match. It contains the chosen city",
			ctx.match,
		);
		await ctx.answerCallbackQuery("You hit a button in a submenu");
		return false;
	},
});
submenuTemplate.manualRow(createBackMainMenuButtons());

menuTemplate.chooseIntoSubmenu("unique", submenuTemplate, {
	choices: ["Gotham", "Mos Eisley", "Springfield"],
});
```

### Can I close the menu?

You can delete the message like you would do with grammY: `ctx.deleteMessage()`.
Keep in mind: You can not delete messages which are older than 48 hours.

`deleteMenuFromContext` tries to help you with that:
It tries to delete the menu.
If that does not work the keyboard is removed from the message, so the user will not accidentally press something.

```ts
menuTemplate.interact("unique", {
	text: "Delete the menu",
	do: async (context) => {
		await deleteMenuFromContext(context);
		// Make sure not to try to update the menu afterwards. You just deleted it and it would just fail to update a missing message.
		return false;
	},
});
```

### Can I send the menu manually?

If you want to send the root menu use `ctx => menuMiddleware.replyToContext(ctx)`

```ts
const menuMiddleware = new MenuMiddleware("/", menuTemplate);
bot.command("start", (ctx) => menuMiddleware.replyToContext(ctx));
```

You can also specify a path to the `replyToContext` function for the specific submenu you want to open.
See [How does it work](#how-does-it-work) to understand which path you have to supply as the last argument.

```ts
const menuMiddleware = new MenuMiddleware("/", menuTemplate);
bot.command("start", (ctx) => menuMiddleware.replyToContext(ctx, path));
```

You can also use `sendMenu` functions like `replyMenuToContext` to send a menu manually.

```ts
import { MenuTemplate, replyMenuToContext } from "grammy-inline-menu";
const settingsMenu = new MenuTemplate("Settings");
bot.command(
	"settings",
	async (ctx) => replyMenuToContext(settingsMenu, ctx, "/settings/"),
);
```

### Can I send the menu from external events?

When sending from external events you still have to supply the context to the message or some parts of your menu might not work as expected!

See [How does it work](#how-does-it-work) to understand which path you have to supply as the last argument of `generateSendMenuToChatFunction`.

```ts
const sendMenuFunction = generateSendMenuToChatFunction(
	bot.telegram,
	menu,
	"/settings/",
);

async function externalEventOccured() {
	await sendMenuFunction(userId, context);
}
```

### Didn't this menu had a question function?

Yes. It was moved into a separate library with version 5 as it made the source code overly complicated.

When you want to use it check [`stateless-question`](https://github.com/grammyjs/stateless-question).

```ts
import { StatelessQuestion } from "@grammyjs/stateless-question";
import { getMenuOfPath } from "grammy-inline-menu";

const myQuestion = new StatelessQuestion<MyContext>(
	"unique",
	async (context, additionalState) => {
		const answer = context.message.text;
		console.log("user responded with", answer);
		await replyMenuToContext(menuTemplate, context, additionalState);
	},
);

bot.use(myQuestion.middleware());

menuTemplate.interact("unique", {
	text: "Question",
	do: async (context, path) => {
		const text = "Tell me the answer to the world and everything.";
		const additionalState = getMenuOfPath(path);
		await myQuestion.replyWithMarkdown(context, text, additionalState);
		return false;
	},
});
```

## Documentation

The methods should have explaining documentation by itself.
Also, there should be multiple `@example` entries in the docs to see different ways of using the method.

If you think the JSDoc / README can be improved just go ahead and create a Pull Request.
Let's improve things together!
