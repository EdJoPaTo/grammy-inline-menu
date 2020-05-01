import {readFileSync} from 'fs'

import {Telegraf, Context as TelegrafContext} from 'telegraf'

import {MenuTemplate, MenuMiddleware, createBackMainMenuButtons} from '../source'

const menu = new MenuTemplate<TelegrafContext>(() => 'Main Menu\n' + new Date().toISOString())

menu.url('EdJoPaTo.de', 'https://edjopato.de')

let mainMenuToggle = false
menu.toggle('toggle me', 'a', {
	set: (_, newState) => {
		mainMenuToggle = newState
	},
	isSet: () => mainMenuToggle
})

menu.interact('interaction', 'c', {
	hide: () => mainMenuToggle,
	do: async ctx => ctx.answerCbQuery('you clicked me!')
})

menu.interact('update after action', 'd', {
	joinLastRow: true,
	hide: () => mainMenuToggle,
	do: async (ctx, next) => {
		await ctx.answerCbQuery('I will update the menu now…')
		return next()
	}
})

let selectedKey = 'b'
menu.select('s', ['A', 'B', 'C'], {
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
	if (entry && entry.food) {
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
foodSelectSubmenu.toggle('Prefer Tee', 't', {
	set: (ctx, choice) => {
		const person = ctx.match![1]
		people[person].tee = choice
	},
	isSet: ctx => {
		const person = ctx.match![1]
		return people[person].tee === true
	}
})
foodSelectSubmenu.select('f', food, {
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

foodMenu.chooseIntoSubmenu('p', () => Object.keys(people), foodSelectSubmenu, {
	buttonText: personButtonText,
	columns: 2
})
foodMenu.manualRow(createBackMainMenuButtons())

menu.submenu('Food menu', 'food', foodMenu, {
	hide: () => mainMenuToggle
})

let isAndroid = true
const photoMenu = new MenuTemplate<TelegrafContext>(() => ({
	photo: {
		filename: 'device.jpg',
		url: isAndroid ? 'https://telegram.org/img/SiteAndroid.jpg' : 'https://telegram.org/img/SiteiOs.jpg'
	}
}))
photoMenu.interact('Just a button', 'a', {
	do: async ctx => ctx.answerCbQuery('Just a callback query answer')
})
photoMenu.select('img', ['iOS', 'Android'], {
	isSet: (_ctx, key) => key === 'Android' ? isAndroid : !isAndroid,
	set: (_ctx, key) => {
		isAndroid = key === 'Android'
	}
})
photoMenu.manualRow(createBackMainMenuButtons())

menu.submenu('Photo Menu', 'photo', photoMenu)

const menuMiddleware = new MenuMiddleware<TelegrafContext>('/', menu)

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
