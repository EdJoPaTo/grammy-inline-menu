import test from 'ava'

const {buildKeyboardButton} = require('./build-keyboard')

test('hide is questioned first and does not trigger other func', async t => {
  const result = await buildKeyboardButton({
    text: () => t.fail(),
    textPrefix: () => t.fail(),
    actionCode: 'a',
    hide: () => true
  }, 42)
  t.true(result.hide)
})

test('async func possible', async t => {
  const result = await buildKeyboardButton({
    text: () => Promise.resolve(42),
    textPrefix: () => Promise.resolve(7),
    actionCode: 'a',
    hide: () => Promise.resolve(false)
  })
  t.deepEqual(result, {
    text: '7 42',
    callback_data: 'a',
    hide: false
  })
})

test('textPrefix works', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    textPrefix: '7',
    actionCode: 'a'
  })
  t.deepEqual(result, {
    text: '7 42',
    callback_data: 'a',
    hide: false
  })
})
