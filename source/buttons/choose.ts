import {ConstOrPromise} from '../generic-types'
import {ManyChoicesOptions} from '../choices'
import {MenuAfterwardsTarget} from '../action-hive'

export type ChooseActionFunc<Context> = (context: Context, key: string) => ConstOrPromise<MenuAfterwardsTarget>

export interface ChooseOptions<Context> extends ManyChoicesOptions<Context> {
	readonly do: ChooseActionFunc<Context>;
}
