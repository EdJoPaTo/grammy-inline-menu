import test from 'ava'

import {
  prefixText
} from './prefix'

test('no prefix', async t => {
  const result = await prefixText('42', undefined)
  t.is(result, '42')
})

test('value text & prefix', async t => {
  const result = await prefixText('42', '6')
  t.is(result, '6 42')
})

test('async text', async t => {
  const text = (): Promise<string> => Promise.resolve('42')
  const result = await prefixText(text, undefined)
  t.is(result, '42')
})

test('async prefix', async t => {
  const prefix = (): Promise<string> => Promise.resolve('6')
  const result = await prefixText('42', prefix)
  t.is(result, '6 42')
})

test('async text and prefix', async t => {
  const text = (): Promise<string> => Promise.resolve('42')
  const prefix = (): Promise<string> => Promise.resolve('6')
  const result = await prefixText(text, prefix)
  t.is(result, '6 42')
})
