import {ManyChoicesOptions} from '../choices'

import {BasicOptions, SingleButtonOptions} from './basic'

export interface SubmenuOptions<Context> extends BasicOptions<Context>, SingleButtonOptions<Context> {
}

export interface ChooseIntoSubmenuOptions<Context> extends BasicOptions<Context>, ManyChoicesOptions<Context> {
}
