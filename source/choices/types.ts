import {BasicOptions} from '../buttons/basic'
import {ConstOrPromise} from '../generic-types'
import {GenericPaginationOptions} from '../buttons/pagination'

export type Choice = string | number
export type ChoiceText = string
export type ChoicesArray = readonly Choice[]
export type ChoicesRecord = Record<Choice, ChoiceText>
export type ChoicesMap = ReadonlyMap<string, ChoiceText>
export type Choices = ChoicesArray | ChoicesRecord | ChoicesMap

export type ChoiceTextFunc<Context> = (context: Context, key: string) => ConstOrPromise<string>

export interface ManyChoicesOptions<Context> extends BasicOptions<Context>, Partial<GenericPaginationOptions<Context>> {
	readonly columns?: number;
	readonly maxRows?: number;
	readonly buttonText?: ChoiceTextFunc<Context>;
}
