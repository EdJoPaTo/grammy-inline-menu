import test from 'ava'

import {getRowsOfButtons} from './align-buttons'

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
