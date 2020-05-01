import test, {ExecutionContext} from 'ava'

import {filterNonNullable, isRegExpExecArray, isObject} from './generic-types'

function filterNonNullableTypesafeEqual(t: ExecutionContext, actual: string[], expected: string[]): void {
	t.deepEqual(actual, expected)
}

test('filterNonNullable', t => {
	const input = ['bla', undefined, 'blubb', null]
	// eslint-disable-next-line unicorn/no-fn-reference-in-iterator
	const output = input.filter(filterNonNullable())
	filterNonNullableTypesafeEqual(t, output, ['bla', 'blubb'])
})

test('isRegExpExecArray true', t => {
	t.true(isRegExpExecArray(/bla/.exec('bla')))
	t.true(isRegExpExecArray(/b(la)/.exec('bla')))
})

test('isRegExpExecArray null', t => {
	t.false(isRegExpExecArray(null))
	t.false(isRegExpExecArray(/bla/.exec('blubb')))
})

test('isRegExpExecArray array without string entry', t => {
	t.false(isRegExpExecArray([]))
	t.false(isRegExpExecArray([42]))
})

test('isRegExpExecArray normal string array', t => {
	t.false(isRegExpExecArray(['bla']))
	t.false(isRegExpExecArray(['bla', 'la']))
})

test('isObject examples', t => {
	t.true(isObject({}))
	t.true(isObject(t))
	t.false(isObject('bla'))
	t.false(isObject(() => 'bla'))
	t.false(isObject(5))
	t.false(isObject(null))
	t.false(isObject(true))
	t.false(isObject(undefined))
})
