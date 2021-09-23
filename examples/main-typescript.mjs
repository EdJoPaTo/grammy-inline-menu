// This is the same example as the main-typescript.ts just without type anotations.
// Consider using TypeScript. If you compare both examples they are fairly similar.
// Learning TypeScript will be worth it!
//
// If you just want to use JavaScript, go ahead :)

import * as process from 'process'

import {Bot} from 'grammy'

import {MenuTemplate, MenuMiddleware, createBackMainMenuButtons} from '../dist/source/index.js'

const menu = new MenuTemplate(() => 'Main Menu\n' + new Date().toISOString())

menu.url('EdJoPaTo.de', 'https://edjopato.de')

let mainMenuToggle = false
menu.toggle('toggle me', 'toggle me', {
	set: (_, newState) => {
		mainMenuToggle = newState
		// Update the menu afterwards
		return true
	},
	isSet: () => mainMenuToggle,
})

menu.interact('interaction', 'interact', {
	hide: () => mainMenuToggle,
	do: async ctx => {
		await ctx.answerCallbackQuery({text: 'you clicked me!'})
		// Do not update the menu afterwards
		return false
	},
})

menu.interact('update after action', 'update afterwards', {
	joinLastRow: true,
	hide: () => mainMenuToggle,
	do: async ctx => {
		await ctx.answerCallbackQuery({text: 'I will update the menu now…'})

		return true

		// You can return true to update the same menu or use a relative path
		// For example '.' for the same menu or '..' for the parent menu
		// return '.'
	},
})

let selectedKey = 'b'
menu.select('select', ['A', 'B', 'C'], {
	set: async (ctx, key) => {
		selectedKey = key
		await ctx.answerCallbackQuery({text: `you selected ${key}`})
		return true
	},
	isSet: (_, key) => key === selectedKey,
})

const foodMenu = new MenuTemplate('People like food. What do they like?')

const people = {Mark: {}, Paul: {}}
const food = ['bread', 'cake', 'bananas']

function personButtonText(_, key) {
	const entry = people[key]
	if (entry?.food) {
		return `${key} (${entry.food})`
	}

	return key
}

function foodSelectText(ctx) {
	const person = ctx.match[1]
	const hisChoice = people[person].food
	if (!hisChoice) {
		return `${person} is still unsure what to eat.`
	}

	return `${person} likes ${hisChoice} currently.`
}

const foodSelectSubmenu = new MenuTemplate(foodSelectText)
foodSelectSubmenu.toggle('Prefer tea', 'tea', {
	set: (ctx, choice) => {
		const person = ctx.match[1]
		people[person].tee = choice
		return true
	},
	isSet: ctx => {
		const person = ctx.match[1]
		return people[person].tee === true
	},
})
foodSelectSubmenu.select('food', food, {
	set: (ctx, key) => {
		const person = ctx.match[1]
		people[person].food = key
		return true
	},
	isSet: (ctx, key) => {
		const person = ctx.match[1]
		return people[person].food === key
	},
})
foodSelectSubmenu.manualRow(createBackMainMenuButtons())

foodMenu.chooseIntoSubmenu('person', () => Object.keys(people), foodSelectSubmenu, {
	buttonText: personButtonText,
	columns: 2,
})
foodMenu.manualRow(createBackMainMenuButtons())

menu.submenu('Food menu', 'food', foodMenu, {
	hide: () => mainMenuToggle,
})

let mediaOption = 'photo1'
const mediaMenu = new MenuTemplate(() => {
	if (mediaOption === 'video') {
		return {
			type: 'video',
			media: 'https://telegram.org/img/t_main_Android_demo.mp4',
			text: 'Just a caption for a video',
		}
	}

	if (mediaOption === 'animation') {
		return {
			type: 'animation',
			media: 'https://telegram.org/img/t_main_Android_demo.mp4',
			text: 'Just a caption for an animation',
		}
	}

	if (mediaOption === 'photo2') {
		return {
			type: 'photo',
			media: 'https://telegram.org/img/SiteAndroid.jpg',
			text: 'Just a caption for a *photo*',
			parse_mode: 'Markdown',
		}
	}

	if (mediaOption === 'document') {
		return {
			type: 'document',
			media: 'https://telegram.org/file/464001088/1/bI7AJLo7oX4.287931.zip/374fe3b0a59dc60005',
			text: 'Just a caption for a <b>document</b>',
			parse_mode: 'HTML',
		}
	}

	if (mediaOption === 'location') {
		return {
			// Some point with simple coordinates in Hamburg, Germany
			location: {
				latitude: 53.5,
				longitude: 10,
			},
			live_period: 60,
		}
	}

	if (mediaOption === 'venue') {
		return {
			venue: {
				location: {
					latitude: 53.5,
					longitude: 10,
				},
				title: 'simple coordinates point',
				address: 'Hamburg, Germany',
			},
		}
	}

	if (mediaOption === 'just text') {
		return {
			text: 'Just some text',
		}
	}

	return {
		type: 'photo',
		media: 'https://telegram.org/img/SiteiOs.jpg',
	}
})
mediaMenu.interact('Just a button', 'randomButton', {
	do: async ctx => {
		await ctx.answerCallbackQuery({text: 'Just a callback query answer'})
		return false
	},
})
mediaMenu.select('type', ['animation', 'document', 'photo1', 'photo2', 'video', 'location', 'venue', 'just text'], {
	columns: 2,
	isSet: (_, key) => mediaOption === key,
	set: (_, key) => {
		mediaOption = key
		return true
	},
})
mediaMenu.manualRow(createBackMainMenuButtons())

menu.submenu('Media Menu', 'media', mediaMenu)

const menuMiddleware = new MenuMiddleware('/', menu)
console.log(menuMiddleware.tree())

const bot = new Bot(process.env['BOT_TOKEN'])

bot.on('callback_query:data', async (ctx, next) => {
	console.log('another callbackQuery happened', ctx.callbackQuery.data.length, ctx.callbackQuery.data)
	return next()
})

bot.command('start', async ctx => menuMiddleware.replyToContext(ctx))
bot.use(menuMiddleware.middleware())

bot.catch(error => {
	console.log('bot error', error)
})

async function startup() {
	const {username} = await bot.api.getMe()
	console.log(new Date(), 'Bot starts as', username)
	await bot.start()
}

startup()
