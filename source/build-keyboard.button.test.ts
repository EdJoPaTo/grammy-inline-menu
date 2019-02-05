import test from 'ava'
import ActionCode from './action-code'

import {buildKeyboardButton} from './build-keyboard'

test('hide is questioned first and does not trigger other func', async t => {
  const result = await buildKeyboardButton({
    text: () => {
      t.fail()
      return ''
    },
    action: 'a',
    hide: () => true
  }, new ActionCode(''), 42)
  t.is(result, undefined)
})

test('async func possible', async t => {
  const result = await buildKeyboardButton({
    text: () => Promise.resolve('42'),
    action: 'a',
    hide: () => Promise.resolve(false)
  }, new ActionCode(''), {})
  t.deepEqual(result, {
    text: '42',
    callback_data: 'a'
  })
})

test('action', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    action: 'a'
  }, new ActionCode('c'), {})
  t.deepEqual(result, {
    text: '42',
    callback_data: 'c:a'
  })
})

test('action method', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    action: () => 'a'
  }, new ActionCode('c'), {})
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
  }, new ActionCode('c'), {})
  t.deepEqual(result, {
    text: '42',
    callback_data: 'a'
  })
})

test('url', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    url: 'https://edjopato.de'
  }, new ActionCode('main'), {})
  t.deepEqual(result, {
    text: '42',
    url: 'https://edjopato.de'
  })
})

test('url method', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    url: () => 'https://edjopato.de'
  }, new ActionCode('main'), {})
  t.deepEqual(result, {
    text: '42',
    url: 'https://edjopato.de'
  })
})

test('switchToChat', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    switchToChat: '42'
  }, new ActionCode('main'), {})
  t.deepEqual(result, {
    text: '42',
    switch_inline_query: '42'
  })
})

test('switchToChat method', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    switchToChat: () => '42'
  }, new ActionCode('main'), {})
  t.deepEqual(result, {
    text: '42',
    switch_inline_query: '42'
  })
})

test('switchToCurrentChat', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    switchToCurrentChat: '42'
  }, new ActionCode('main'), {})
  t.deepEqual(result, {
    text: '42',
    switch_inline_query_current_chat: '42'
  })
})

test('switchToCurrentChat method', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    switchToCurrentChat: () => '42'
  }, new ActionCode('main'), {})
  t.deepEqual(result, {
    text: '42',
    switch_inline_query_current_chat: '42'
  })
})

test('unfinished button', async t => {
  await t.throwsAsync(() => buildKeyboardButton({
    text: '42'
  }, new ActionCode('main'), {}))
})
