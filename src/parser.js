const REGEX_SINGLE_LINE_COMMENT = /\/\/\S*(?:\n|\r)/g
const trimAndRemoveComments = str =>
  str
  .replace(REGEX_SINGLE_LINE_COMMENT, '')
  .trim()


const EMPTY = ''
const PROMISE = 'PROMISE'

const AND = 'AND'
const OR = 'OR'
const NOT = 'NOT'
const QUESTION_MARK = 'QUESTION_MARK'
const COLON = 'COLON'
const LPAREN = 'LPAREN'
const RPAREN = 'RPAREN'

const OPERATORS = {
  '&&': AND,
  '||': OR,
  '!': NOT,
  '?': QUESTION_MARK,
  ':': COLON,
  '(': LPAREN,
  ')': RPAREN
}


function Token (type, value = null) {
  this.type = type
  this.value = value
}

class Node {
  constructor (type) {
    this.type = type
  }
}

export class ItemNode extends Node {
  constructor (item) {
    super('Item')
    this.item = item
  }
}

export class UnaryExpression extends Node {
  constructor (argument) {
    super('UnaryExpression')
    this.argument = argument
  }
}

export class LogicalExpression {
  constructor (operator, left, right) {
    super('LogicalExpression')
    this.operator = operator
    this.left = left
    this.right = right
  }
}

export class ConditionalExpression extends Node {
  constructor (condition, consequent, alternate) {
    super('ConditionalExpression')
    this.condition = condition
    this.consequent = consequent
    this.alternate = alternate
  }
}


export default class Parser {
  constructor (operators, items) {
    this._operatorPointer = -1
    this._itemsPointer = -1
    this._useOperatorNext = true

    this._offset = 0
    this._originalOperators = operators
    this._operators = this._cleanOperators(operators)
    .map(trimAndRemoveComments)
    this._items = items

    this._currentToken = null

    this._operatorsLength = this._operators.length
    this._itemsLength = this._items.length

    this.advance()
  }

  // `${a} && ${b}` -> ['', ' && ', ${b}]
  _cleanOperators (operators) {
    let start = 0

    if (operators[0] === EMPTY) {
      start = 1
      this._useOperatorNext = false
      this._offset = 1
    }

    return operators[operators.length - 1] === EMPTY
      ? operators.slice(start, -1)
      : operators.slice(start)
  }

  parse () {
    return this.expr()
  }

  // error (message) {
  //   // TODO
  //   throw message
  // }

  // Lexer
  ////////////////////////////////////////////////////////////////////

  // Reader go to next
  advance () {
    const isOperator = this._useOperatorNext
    this._useOperatorNext = !isOperator

    const current =
      ? this._advanceOperator()
      : this._advancePromise()

    return this._current = current
      ? isOperator
        ? new Token(OPERATORS[current])
        : new Token(PROMISE, current)
      : null
  }

  // Test the current token and go to next
  eat (type) {
    if (this._currentToken && this._currentToken === type) {
      return this.advance()
    }

    // TODO
    throw 'WRONG_TYPE'
  }

  _advanceOperator () {
    const index = ++ this._operatorPointer

    if (index < this._operatorsLength) {
      return this._operators[index]
    }
  }

  _advancePromise () {
    const index = ++ this._promisePointer

    if (index < this._promisesLength) {
      return this._promises[index]
    }
  }

  // Non-terminals
  ////////////////////////////////////////////////////////////////////

  // Priorities (High -> Low):
  // - (promise)
  // - grouping
  // - NOT
  // - AND
  // - OR
  // - Ternary

  // BNF:
  // <expr>    ::= <or> | <or> QUESTION_MARK <expr> COLON <expr>
  // <or>      ::= <and> ( OR <or> )*
  // <and>     ::= <not> ( AND <and> )*
  // <not>     ::= NOT <factor> | <factor>
  // <factor>  ::= promise | LPAREN <expr> RPAREN

  // Terminals:
  // - operators
  // - promise

  expr () {
    const or = this.or()
    this.advance()

    const token = this._currentToken
    if (!token) {
      return or
    }

    if (token.type === QUESTION_MARK) {
      const consequent = this.expr()
      this.eat(COLON)
      const alternate = this.expr()
      return ConditionalExpression(or, consequent, alternate)
    }

    throw 'UNEXPECTED_TOKEN'
  }

  or () {
    const left = this.and()
    this.advance()
    const token = this._currentToken

    if (token && token.type === OR) {
      this.advance()
      const right = this.or()
      return new LogicalExpression(OR, left, right)
    }

    return left
  }

  and () {
    const left = this.not()
    this.advance()

    const token = this._currentToken

    if (token && token.type === AND) {
      this.advance()
      const right = this.and()
      return new LogicalExpression(AND, left, right)
    }

    return left
  }

  not () {
    const token = this._currentToken

    if (token.type === NOT) {
      return new UnaryExpression(this.factor())
    }

    return this.factor()
  }

  factor () {
    const token = this._currentToken

    if (token.type === PROMISE) {
      return new ItemNode(token.value)
    }

    if (token.type === LPAREN) {
      const node = this.expr()
      this.eat(RPAREN)
      return node
    }
  }
}