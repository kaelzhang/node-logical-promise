import test from 'ava'
import logical, {
  factory,
  FULLFILLED,
  FULLFILLED_AND_TRUE
} from '../src'

import {
  getArgs
} from './lib/utils'

import safeEval from 'safe-eval'

const CASES = [
  '1 && 2',
  ['1 && 0', 0],
  ['0 && 1', 0],
  '(1)',
  '1',
  '1 ? 2 : 3',
  '1 ? 2 ? 3 : 4 : 5',
  '1 ? 2 : 3 ? 4 : 5',
  '1 && 2 ? 2 : 3',
  '1 && (2 || 3)',
  '0 || 1',
  ['0 || 0', 0],
  '!0 && 1'
]
.map(a => {
  const [
    code,
    reject,
    only
  ] = Array.isArray(a)
    ? a
    : [a]

  return [code, safeEval(code), reject, only]
})


function run (runner, transformer, hasReject, checker, checkerName) {
  return ([code, expect, reject, only]) => {
    const extra = checkerName
      ? `, checker: ${checkerName}`
      : ''

    ;(only ? test.only : test)(`${code}${extra}`, async t => {
      const result = checker
        ? runner(checker)(...getArgs(code, transformer))
        : runner(...getArgs(code, transformer))

      if (hasReject && reject !== undefined) {
        result.then(
          () => {
            t.fail('should reject')
          },

          value => {
            t.is(value, expect)
          }
        )

        return
      }

      t.is(await result, expect)
    })
  }
}


const numberToPromise = n => Promise.resolve(Number(n))
const numberToPromiseFactory = n => () => numberToPromise(n)

const zeroToReject = n => {
  n = Number(n)
  return n
    ? Promise.resolve(n)
    : Promise.reject(n)
}

const zeroToRejectFactory = n => () => zeroToReject(n)


CASES.forEach(run(
  logical, zeroToReject, true, false, 'logical``'))

CASES.forEach(run(
  logical, numberToPromise, false, FULLFILLED_AND_TRUE,
  'logical(FULLFILLED_AND_TRUE)``'))

CASES.forEach(run(factory, zeroToRejectFactory, true, false, 'factory``'))

CASES.forEach(run(
  factory, numberToPromiseFactory, false, FULLFILLED_AND_TRUE,
  'factory(FULLFILLED_AND_TRUE)``'
))

test('error: not function', async t => {
  try {
    factory `${1} && ${2}`
  } catch (e) {
    t.is(e.code, 'NOT_FUNCTION')
    return
  }

  t.fail('should throw')
})
