import type {ManyChoicesOptions} from '../choices/index.js';
import type {SingleButtonOptions} from './basic.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SubmenuOptions<Context> extends SingleButtonOptions<Context> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ChooseIntoSubmenuOptions<Context>
	extends ManyChoicesOptions<Context> {}
