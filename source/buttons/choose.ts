import {ManyChoicesOptions} from '../choices'

export type ChooseActionFunc<Context> = (context: Context, next: () => Promise<void>, key: string) => Promise<unknown> | void

export interface ChooseOptions<Context> extends ManyChoicesOptions<Context> {
	readonly do: ChooseActionFunc<Context>;
}
