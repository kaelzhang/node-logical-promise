const AND = '&&'
const OR = '||'
const NOT = '!'
const QUESTION_MARK = '?'
const COLON = ':'
const LPAREN = '('
const RPAREN = ')'


const wrapPromise = subject => Promise.resolve(subject)
const wrapPromiseFactory = subject => Promise.resolve(subject())


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
    return (...args) => _factory(checker, wrapPromiseFactory, ...args)
  }

  return _factory(FULLFILLED, wrapPromiseFactory, ...args)
}


export default checker => {
  if (typeof checker === 'function') {
    return (...args) => _factory(checker, wrapPromise, ...args)
  }

  return _factory(FULLFILLED, wrapPromise, ...args)
}


// BNF
// <expr>    ::= factor || logical
// <ternary> ::= <term> QUESTION_MARK <expr> COLON <expr>
// <term>    ::= <item> ( (AND || OR) <item> )*
// <item>    ::= <factor> | NOT <factor>
// <factor>  ::= promise | LPAREN <expr> RPAREN

const _factory = (checker, wrapper, operators, ...factories) => {

}
