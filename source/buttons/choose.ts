import {ConstOrPromise} from '../generic-types'
import {ManyChoicesOptions} from '../choices'

export type ChooseActionFunc<Context> = (context: Context, key: string) => ConstOrPromise<string | boolean>

export interface ChooseOptions<Context> extends ManyChoicesOptions<Context> {
	readonly do: ChooseActionFunc<Context>;
}
