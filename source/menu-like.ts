import type {ButtonAction} from './action-hive.js';
import type {Body} from './body.js';
import type {ContextPathFunc, RegExpLike} from './generic-types.js';
import type {InlineKeyboard} from './keyboard.js';

export type MenuLike<Context> = {
	readonly renderBody: ContextPathFunc<Context, Body>;
	readonly renderKeyboard: ContextPathFunc<Context, InlineKeyboard>;
	readonly renderActionHandlers: (
		path: RegExpLike,
	) => ReadonlySet<ButtonAction<Context>>;
	readonly listSubmenus: () => ReadonlySet<Submenu<Context>>;
};

export type Submenu<Context> = {
	readonly action: RegExpLike;
	readonly hide: undefined | ContextPathFunc<Context, boolean>;
	readonly menu: MenuLike<Context>;
};
