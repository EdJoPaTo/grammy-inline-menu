import {readFileSync} from 'fs'

import {Telegraf, Context as TelegrafContext} from 'telegraf'

import {MenuTemplate, MenuMiddleware, createBackMainMenuButtons} from '../source'

const menu = new MenuTemplate<TelegrafContext>(() => 'Main Menu\n' + new Date().toISOString())

menu.url('EdJoPaTo.de', 'https://edjopato.de')

let mainMenuToggle = false
menu.toggle('toggle me', 'toggle me', {
	set: (_, newState) => {
		mainMenuToggle = newState
	},
	isSet: () => mainMenuToggle
})

menu.interact('interaction', 'interact', {
	hide: () => mainMenuToggle,
	do: async ctx => {
		await ctx.answerCbQuery('you clicked me!')
	}
})

menu.interact('update after action', 'update afterwards', {
	joinLastRow: true,
	hide: () => mainMenuToggle,
	do: async ctx => {
		await ctx.answerCbQuery('I will update the menu now…')
		return '.'
	}
})

let selectedKey = 'b'
menu.select('select', ['A', 'B', 'C'], {
	set: async (ctx, key) => {
		selectedKey = key
		await ctx.answerCbQuery(`you selected ${key}`)
	},
	isSet: (_, key) => key === selectedKey
})

const foodMenu = new MenuTemplate<TelegrafContext>('People like food. What do they like?')

interface FoodChoises {
	food?: string;
	tee?: boolean;
}

const people: Record<string, FoodChoises> = {Mark: {}, Paul: {}}
const food = ['bread', 'cake', 'bananas']

function personButtonText(_: TelegrafContext, key: string): string {
	const entry = people[key] as FoodChoises | undefined
	if (entry?.food) {
		return `${key} (${entry.food})`
	}

	return key
}

function foodSelectText(ctx: TelegrafContext): string {
	const person = ctx.match![1]
	const hisChoice = people[person].food
	if (!hisChoice) {
		return `${person} is still unsure what to eat.`
	}

	return `${person} likes ${hisChoice} currently.`
}

const foodSelectSubmenu = new MenuTemplate<TelegrafContext>(foodSelectText)
foodSelectSubmenu.toggle('Prefer tea', 'tea', {
	set: (ctx, choice) => {
		const person = ctx.match![1]
		people[person].tee = choice
	},
	isSet: ctx => {
		const person = ctx.match![1]
		return people[person].tee === true
	}
})
foodSelectSubmenu.select('food', food, {
	set: (ctx, key) => {
		const person = ctx.match![1]
		people[person].food = key
	},
	isSet: (ctx, key) => {
		const person = ctx.match![1]
		return people[person].food === key
	}
})
foodSelectSubmenu.manualRow(createBackMainMenuButtons())

foodMenu.chooseIntoSubmenu('person', () => Object.keys(people), foodSelectSubmenu, {
	buttonText: personButtonText,
	columns: 2
})
foodMenu.manualRow(createBackMainMenuButtons())

menu.submenu('Food menu', 'food', foodMenu, {
	hide: () => mainMenuToggle
})

let mediaOption = 'photo1'
const mediaMenu = new MenuTemplate<TelegrafContext>(() => {
	if (mediaOption === 'video') {
		return {
			type: 'video',
			media: {
				filename: 'android.mp4',
				url: 'https://telegram.org/img/t_main_Android_demo.mp4'
			},
			text: 'Just a caption for a video'
		}
	}

	if (mediaOption === 'animation') {
		return {
			type: 'animation',
			media: {
				filename: 'android.mp4',
				url: 'https://telegram.org/img/t_main_Android_demo.mp4'
			},
			text: 'Just a caption for an animation'
		}
	}

	if (mediaOption === 'photo2') {
		return {
			type: 'photo',
			media: {
				filename: 'android.jpg',
				url: 'https://telegram.org/img/SiteAndroid.jpg'
			},
			text: 'Just a caption for a *photo*',
			parse_mode: 'Markdown'
		}
	}

	if (mediaOption === 'document') {
		return {
			type: 'document',
			media: {
				filename: 'logos.zip',
				url: 'https://telegram.org/file/464001088/1/bI7AJLo7oX4.287931.zip/374fe3b0a59dc60005'
			},
			text: 'Just a caption for a <b>document</b>',
			parse_mode: 'HTML'
		}
	}

	if (mediaOption === 'just text') {
		return {
			text: 'Just some text'
		}
	}

	return {
		type: 'photo',
		media: {
			filename: 'ios.jpg',
			url: 'https://telegram.org/img/SiteiOs.jpg'
		}
	}
})
mediaMenu.interact('Just a button', 'randomButton', {
	do: async ctx => {
		await ctx.answerCbQuery('Just a callback query answer')
	}
})
mediaMenu.select('type', ['animation', 'document', 'photo1', 'photo2', 'video', 'just text'], {
	columns: 2,
	isSet: (_, key) => mediaOption === key,
	set: (_, key) => {
		mediaOption = key
	}
})
mediaMenu.manualRow(createBackMainMenuButtons())

menu.submenu('Media Menu', 'media', mediaMenu)

const menuMiddleware = new MenuMiddleware<TelegrafContext>('/', menu)
console.log(menuMiddleware.tree())

const token = readFileSync('token.txt', 'utf8').trim()
const bot = new Telegraf(token)

bot.use(async (ctx, next) => {
	if (ctx.callbackQuery && ctx.callbackQuery.data) {
		console.log('another callbackQuery happened', ctx.callbackQuery.data.length, ctx.callbackQuery.data)
	}

	return next()
})

bot.command('start', async ctx => menuMiddleware.replyToContext(ctx))
bot.use(menuMiddleware.middleware())

bot.catch((error: any) => {
	console.log('telegraf error', error.response, error.parameters, error.on || error)
})

async function startup(): Promise<void> {
	await bot.launch()
	console.log(new Date(), 'Bot started as', bot.options.username)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
startup()
