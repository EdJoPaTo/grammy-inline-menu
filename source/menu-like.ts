import type {ButtonAction} from './action-hive.ts';
import type {Body} from './body.ts';
import type {ContextPathFunc, RegExpLike} from './generic-types.ts';
import type {InlineKeyboard} from './keyboard.ts';

export type MenuLike<Context> = {
	readonly renderBody: ContextPathFunc<Context, Body>;
	readonly renderKeyboard: ContextPathFunc<Context, InlineKeyboard>;
	readonly renderActionHandlers: (
		path: RegExpLike,
	) => ReadonlySet<ButtonAction<Context>>;
	readonly listSubmenus: () => ReadonlySet<Submenu<Context>>;
};

export type Submenu<Context> = {
	/** Unique within the current menu depth */
	readonly trigger: RegExpLike;
	readonly hide: undefined | ContextPathFunc<Context, boolean>;
	readonly menu: MenuLike<Context>;
};
