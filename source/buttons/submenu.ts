import {ManyChoicesOptions} from '../choices/index.js'

import {SingleButtonOptions} from './basic.js'

export interface SubmenuOptions<Context> extends SingleButtonOptions<Context> {
}

export interface ChooseIntoSubmenuOptions<Context> extends ManyChoicesOptions<Context> {
}
