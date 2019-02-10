import test from 'ava'

import {InternalMenuOptions} from './menu-options'

import MenuButtons from './menu-buttons'

function generateBasicOptions(logger: (...args: any[]) => void, overrides: any = {}): InternalMenuOptions {
  return {
    hasMainMenu: false,
    depth: 1,
    log: logger,
    ...overrides
  }
}

const EXAMPLE_BUTTON = {
  text: '42',
  action: '42'
}

const EXAMPLE_BUTTON_RESULT = {
  text: '42',
  callback_data: '42'
}

test('nothing added', async t => {
  const menu = new MenuButtons()
  const result = await menu.generateKeyboardMarkup({}, 'main', generateBasicOptions(t.log))

  t.deepEqual(result.inline_keyboard, [
  ])
})

test('one Button added', async t => {
  const menu = new MenuButtons()
  menu.add(EXAMPLE_BUTTON)
  const result = await menu.generateKeyboardMarkup({}, 'main', generateBasicOptions(t.log))

  t.deepEqual(result.inline_keyboard, [
    [
      EXAMPLE_BUTTON_RESULT
    ]
  ])
})

test('add first Button to not existing last row', async t => {
  const menu = new MenuButtons()
  menu.add(EXAMPLE_BUTTON, false)
  const result = await menu.generateKeyboardMarkup({}, 'main', generateBasicOptions(t.log))

  t.deepEqual(result.inline_keyboard, [
    [
      EXAMPLE_BUTTON_RESULT
    ]
  ])
})

test('one creator added', async t => {
  const menu = new MenuButtons()
  menu.addCreator(() => [[EXAMPLE_BUTTON]])
  const result = await menu.generateKeyboardMarkup({}, 'main', generateBasicOptions(t.log))

  t.deepEqual(result.inline_keyboard, [
    [
      EXAMPLE_BUTTON_RESULT
    ]
  ])
})

test('button in same row as creator ends up as two rows', async t => {
  const menu = new MenuButtons()
  menu.addCreator(() => [[EXAMPLE_BUTTON]])
  menu.add(EXAMPLE_BUTTON, false)
  const result = await menu.generateKeyboardMarkup({}, 'main', generateBasicOptions(t.log))

  t.deepEqual(result.inline_keyboard, [
    [
      EXAMPLE_BUTTON_RESULT
    ],
    [
      EXAMPLE_BUTTON_RESULT
    ]
  ])
})
