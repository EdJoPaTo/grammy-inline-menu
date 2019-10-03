import test from 'ava'

import {buildKeyboardButton} from './build-keyboard-button'

test('hide is questioned first and does not trigger other func', async t => {
  const result = await buildKeyboardButton({
    text: () => {
      t.fail()
      return ''
    },
    action: 'a',
    hide: () => true
  }, '', {} as any)
  t.is(result, undefined)
})

test('async func possible', async t => {
  const result = await buildKeyboardButton({
    text: async () => '42',
    action: 'a',
    hide: async () => false
  }, '', {} as any)
  t.deepEqual(result, {
    text: '42',
    callback_data: 'a'
  })
})

test('action', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    action: 'a'
  }, 'c', {} as any)
  t.deepEqual(result, {
    text: '42',
    callback_data: 'c:a'
  })
})

test('action method', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    action: () => 'a'
  }, 'c', {} as any)
  t.deepEqual(result, {
    text: '42',
    callback_data: 'c:a'
  })
})

test('action root', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    root: true,
    action: 'a'
  }, 'c', {} as any)
  t.deepEqual(result, {
    text: '42',
    callback_data: 'a'
  })
})

test('url', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    url: 'https://edjopato.de'
  }, 'main', {} as any)
  t.deepEqual(result, {
    text: '42',
    url: 'https://edjopato.de'
  })
})

test('url method', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    url: () => 'https://edjopato.de'
  }, 'main', {} as any)
  t.deepEqual(result, {
    text: '42',
    url: 'https://edjopato.de'
  })
})

test('switchToChat', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    switchToChat: '42'
  }, 'main', {} as any)
  t.deepEqual(result, {
    text: '42',
    switch_inline_query: '42'
  })
})

test('switchToChat method', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    switchToChat: () => '42'
  }, 'main', {} as any)
  t.deepEqual(result, {
    text: '42',
    switch_inline_query: '42'
  })
})

test('switchToCurrentChat', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    switchToCurrentChat: '42'
  }, 'main', {} as any)
  t.deepEqual(result, {
    text: '42',
    switch_inline_query_current_chat: '42'
  })
})

test('switchToCurrentChat method', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    switchToCurrentChat: () => '42'
  }, 'main', {} as any)
  t.deepEqual(result, {
    text: '42',
    switch_inline_query_current_chat: '42'
  })
})

test('unfinished button', async t => {
  await t.throwsAsync(async () => buildKeyboardButton({
    text: '42'
  }, 'main', {} as any))
})
