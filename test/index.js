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
  '1 && 0',
  '0 && 1'
]
.map(code => {
  return [code, safeEval(code)]
})


function run (runner, transformer, checker, checkerName) {
  return ([code, expect]) => {
    checkerName = checkerName
      ? checkerName = `, checker: ${checkerName}`
      : ''

    test(`factory: ${code}${checkerName}`, async t => {
      const result = checker
        ? runner(checker)(...getArgs(code, transformer))
        : runner(...getArgs(code, transformer))

      t.is(await result, expect)
    })
  }
}


const numberToPromise = n => Promise.resolve(Number(n))
const numberToPromiseFactory = n => () => Promise.resolve(Number(n))
const zeroToReject = n => n
  ? Promise.resolve(Number(n))
  : Promise.reject(Number(n))

CASES.forEach(run(logical, zeroToReject))
