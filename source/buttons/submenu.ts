import {ManyChoicesOptions} from '../choices'

import {BasicOptions, SingleButtonOptions} from './basic'

export interface GenericSubmenuOptions<Context> extends BasicOptions<Context> {
	readonly leaveOnChildInteraction?: boolean;
}

export interface SubmenuOptions<Context> extends GenericSubmenuOptions<Context>, SingleButtonOptions<Context> {
}

export interface ChooseIntoSubmenuOptions<Context> extends GenericSubmenuOptions<Context>, ManyChoicesOptions<Context> {
}
