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
  '1 || 0'
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
    checkerName = checkerName
      ? checkerName = `, checker: ${checkerName}`
      : ''

    ;(only ? test.only : test)(`factory: ${code}${checkerName}`, async t => {
      const result = checker
        ? runner(checker)(...getArgs(code, transformer))
        : runner(...getArgs(code, transformer))

      if (hasReject, reject !== undefined) {
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
const numberToPromiseFactory = n => () => Promise.resolve(Number(n))
const zeroToReject = n => {
  n = Number(n)
  return n
    ? Promise.resolve(n)
    : Promise.reject(n)
}

CASES.forEach(run(logical, zeroToReject, true))
