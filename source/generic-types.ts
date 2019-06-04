import {ContextMessageUpdate} from 'telegraf'

type ConstOrPromise<T> = T | Promise<T>

export type ConstOrContextFunc<ReturnType> = ReturnType | ContextFunc<ReturnType>

export type ContextFunc<ReturnType> = (ctx: ContextMessageUpdate) => ConstOrPromise<ReturnType>
export type ContextNextFunc = (ctx: ContextMessageUpdate, next: any) => Promise<void>
export type ContextKeyFunc<ReturnType> = (ctx: ContextMessageUpdate, key: string) => ConstOrPromise<ReturnType>
export type ContextKeyIndexArrFunc<ReturnType> = (ctx: ContextMessageUpdate, key: string, index: number, array: readonly string[]) => ConstOrPromise<ReturnType>
