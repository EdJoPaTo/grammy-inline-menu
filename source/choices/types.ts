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

	/**
	 * Per default the action (do or set) is only run when the user selected choice does exist.
	 * For this the choices are queried again and has to contain the user selection.
	 * Normally this is useful: Shop offers some drinks and user should only click existing drinks. If some drink isnt in the offer, the menu will be updated to show the current drinks instead of calling the do / set.
	 *
	 * Sometimes this behaviour is not helpful and can be disabled.
	 */
	readonly disableChoiceExistsCheck?: boolean;

	readonly buttonText?: ChoiceTextFunc<Context>;
}
