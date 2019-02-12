import test from 'ava'

import {getRowsOfButtons, maximumButtonsPerPage} from './align-buttons'

function generateCharArray(charA: string, charZ: string): string[] {
  // https://stackoverflow.com/questions/24597634/how-to-generate-an-array-of-alphabet-in-jquery/24597663#24597663
  const a = []
  let i = charA.charCodeAt(0)
  const j = charZ.charCodeAt(0)
  for (; i <= j; ++i) {
    a.push(String.fromCharCode(i))
  }

  return a
}

const inputData = generateCharArray('A', 'E')

test('without arg in one line', t => {
  const result = getRowsOfButtons(generateCharArray('A', 'E'))
  t.deepEqual(result, [
    inputData
  ])
})

test('less columns that buttons', t => {
  const result = getRowsOfButtons(generateCharArray('A', 'E'), 3)
  t.deepEqual(result, [
    ['A', 'B', 'C'],
    ['D', 'E']
  ])
})

test('trim by maxRows', t => {
  const result = getRowsOfButtons(generateCharArray('A', 'Z'), 1, 5)
  t.deepEqual(result, [
    ['A'],
    ['B'],
    ['C'],
    ['D'],
    ['E']
  ])
})

test('second page', t => {
  const result = getRowsOfButtons(generateCharArray('A', 'Z'), 1, 3, 2)
  t.deepEqual(result, [
    ['D'],
    ['E'],
    ['F']
  ])
})

test('maximumButtonsPerPage example', t => {
  t.is(maximumButtonsPerPage(2, 3), 6)
  t.is(maximumButtonsPerPage(4, 4), 16)
})

test('maximumButtonsPerPage default', t => {
  t.is(maximumButtonsPerPage(), 60)
})
