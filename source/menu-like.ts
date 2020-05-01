import {InlineKeyboardButton} from 'telegram-typings'

import {Body} from './body'
import {ButtonAction} from './action-hive'
import {ContextFunc, ContextPathFunc, RegExpLike} from './generic-types'

export type InlineKeyboard = ReadonlyArray<ReadonlyArray<Readonly<InlineKeyboardButton>>>

export interface MenuLike<Context> {
	readonly renderBody: ContextPathFunc<Context, Body>;
	readonly renderKeyboard: ContextPathFunc<Context, InlineKeyboard>;
	readonly renderActionHandlers: (path: RegExpLike) => ReadonlySet<ButtonAction<Context>>;
	readonly listSubmenus: () => ReadonlySet<Submenu<Context>>;
}

export interface Submenu<Context> {
	readonly action: RegExpLike;
	readonly hide: undefined | ContextFunc<Context, boolean>;
	readonly leaveOnChildInteraction: boolean;
	readonly menu: MenuLike<Context>;
}
