import {Context as TelegrafContext} from 'telegraf'

type ConstOrPromise<T> = T | Promise<T>

export type ConstOrContextFunc<ReturnType> = ReturnType | ContextFunc<ReturnType>

export type ContextFunc<ReturnType> = (ctx: TelegrafContext) => ConstOrPromise<ReturnType>
export type ContextNextFunc = (ctx: TelegrafContext, next: () => Promise<void>) => void | Promise<unknown>
export type ContextKeyFunc<ReturnType> = (ctx: TelegrafContext, key: string) => ConstOrPromise<ReturnType>
export type ContextKeyIndexArrFunc<ReturnType> = (ctx: TelegrafContext, key: string, index: number, array: readonly string[]) => ConstOrPromise<ReturnType>
