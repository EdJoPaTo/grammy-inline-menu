type ConstOrContextFunc<T> = T | ContextFunc<T>
type ContextFunc<T> = (ctx: any) => Promise<T> | T

type StringOrStringFunc = ConstOrContextFunc<string>

export type ButtonRow = ButtonInfo[]
export type KeyboardPart = ButtonRow[]
export type KeyboardPartCreator = ContextFunc<KeyboardPart>

export interface ButtonInfo {
  hide?: ((ctx: any) => Promise<boolean> | boolean);
  root?: boolean;
  text: StringOrStringFunc;
  action?: StringOrStringFunc;
  switchToChat?: StringOrStringFunc;
  switchToCurrentChat?: StringOrStringFunc;
  url?: StringOrStringFunc;
}
