import Lexer from './lexer'
import Parser from './parser'
import Runtime from './runtime'
import err from 'err-object'


export const FULLFILLED = promise => {
  return promise.then(
    () => true,
    () => false
  )
}

export const FULLFILLED_AND_TRUE = promise => {
  return promise.then(
    result => !!result,
    () => false
  )
}


export const factory = (...args) => {
  const checker = args[0]
  if (typeof checker === 'function') {
    return (...args) => _factory(checker, true, ...args)
  }

  return _factory(FULLFILLED, true, ...args)
}


export default (...args) => {
  const checker = args[0]
  if (typeof checker === 'function') {
    return (...args) => _factory(checker, false, ...args)
  }

  return _factory(FULLFILLED, false, ...args)
}

// Utilities
////////////////////////////////////////////////////////////////////

const _factory = (checker, useFactory, operators, ...items) => {
  if (useFactory && !items.every(isFunction)) {
    throw err({
      message: 'only accepts factory functions',
      name: 'NotFunctionError',
      code: 'NOT_FUNCTION'
    }, TypeError)
  }

  const lexer = new Lexer(operators, items)
  const AST = new Parser(lexer).parse()
  return new Runtime(
    AST,
    checker,
    useFactory
      ? wrapPromiseFactory
      : wrapPromise
  ).process()
}


const isFunction = subject => typeof subject === 'function'
const wrapPromise = subject => Promise.resolve(subject)
const wrapPromiseFactory = subject => Promise.resolve(subject())
