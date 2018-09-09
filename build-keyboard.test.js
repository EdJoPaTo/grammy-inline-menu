import test from 'ava'

const {buildKeyboard} = require('./build-keyboard')

test('one row one key', async t => {
  const buttons = [[{
    text: '42',
    actionCode: 'a'
  }]]
  const result = await buildKeyboard(buttons)
  t.deepEqual(result.inline_keyboard, [
    [
      {
        text: '42',
        hide: false,
        callback_data: 'a'
      }
    ]
  ])
})

test('four buttons in two rows', async t => {
  const buttons = [
    [{
      text: '42',
      actionCode: 'a'
    }, {
      text: '43',
      actionCode: 'b'
    }], [{
      text: '666',
      actionCode: 'd'
    }, {
      text: '667',
      actionCode: 'e'
    }]
  ]
  const result = await buildKeyboard(buttons)
  t.deepEqual(result.inline_keyboard, [
    [
      {
        text: '42',
        hide: false,
        callback_data: 'a'
      }, {
        text: '43',
        hide: false,
        callback_data: 'b'
      }
    ], [
      {
        text: '666',
        hide: false,
        callback_data: 'd'
      }, {
        text: '667',
        hide: false,
        callback_data: 'e'
      }
    ]
  ])
})

test('row is func that creates one row with one button', async t => {
  const buttons = [
    () => ([[{
      text: '42',
      actionCode: 'a'
    }]])
  ]
  const result = await buildKeyboard(buttons)
  t.deepEqual(result.inline_keyboard, [
    [
      {
        text: '42',
        hide: false,
        callback_data: 'a'
      }
    ]
  ])
})
