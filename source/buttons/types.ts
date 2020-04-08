import {ContextFunc, ConstOrContextFunc} from '../generic-types'

type StringOrStringFunc = ConstOrContextFunc<string>

export type ButtonRow = ButtonInfo[]
export type KeyboardPart = ButtonRow[]
export type KeyboardPartCreator = ContextFunc<KeyboardPart>

export interface ButtonInfo {
  hide?: ContextFunc<boolean>;
  root?: boolean;
  text: StringOrStringFunc;
  action?: StringOrStringFunc;
  switchToChat?: StringOrStringFunc;
  switchToCurrentChat?: StringOrStringFunc;
  url?: StringOrStringFunc;
}
