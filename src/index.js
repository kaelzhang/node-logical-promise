import Parser from './parser'


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


export const factory = checker => {
  if (typeof checker === 'function') {
    return (...args) => _factory(checker, true, ...args)
  }

  return _factory(FULLFILLED, true, ...args)
}


export default checker => {
  if (typeof checker === 'function') {
    return (...args) => _factory(checker, false, ...args)
  }

  return _factory(FULLFILLED, false, ...args)
}

// Utilities
////////////////////////////////////////////////////////////////////

const _factory = (checker, useFactory, operators, ...items) => {
  if (useFactory && !items.every(isFunction)) {
    throw 'NOT_FUNCTION'
  }

  const AST = new Parser(operators, promises).parse()
  return new Runtime(
    checker,
    ast,
    useFactory
      ? wrapPromiseFactory
      : wrapPromise
  ).process()
}


const isFunction = subject => typeof subject !== 'function'
const wrapPromise = subject => Promise.resolve(subject)
const wrapPromiseFactory = subject => Promise.resolve(subject())
