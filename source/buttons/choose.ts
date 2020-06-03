import {ConstOrPromise} from '../generic-types'
import {ManyChoicesOptions} from '../choices'

// Wrongly detected: void is a return type here
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type ChooseActionFunc<Context> = (context: Context, key: string) => ConstOrPromise<string | void>

export interface ChooseOptions<Context> extends ManyChoicesOptions<Context> {
	readonly do: ChooseActionFunc<Context>;
}
