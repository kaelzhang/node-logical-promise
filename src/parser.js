export const EMPTY = ''
export const PROMISE = 'PROMISE'

const AND = 'AND'
const OR = 'OR'
const NOT = 'NOT'
const QUESTION_MARK = 'QUESTION_MARK'
const COLON = 'COLON'
const LPAREN = 'LPAREN'
const RPAREN = 'RPAREN'

const SYMBOL_AND = '&&'
export const SYMBOL_OR = '||'
const SYMBOL_NOT = '!'

export const OPERATORS = {
  [SYMBOL_AND]: AND,
  [SYMBOL_OR]: OR,
  [SYMBOL_NOT]: NOT,
  '?': QUESTION_MARK,
  ':': COLON,
  '(': LPAREN,
  ')': RPAREN
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
  constructor (operator, argument) {
    super('UnaryExpression')
    this.operator = operator
    this.argument = argument
  }
}

export class LogicalExpression extends Node {
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
  constructor (lexer) {
    this._lexer = lexer
    this.advance()
  }

  advance () {
    this._currentToken = this._lexer.advance()
  }

  // Test the current token and go to next
  test (type) {
    if (!this._currentToken || this._currentToken.type !== type) {
      throw `WRONG_TYPE, expect ${type}`
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

  parse () {
    const expr = this.expr()

    if (this._currentToken) { console.log(this._currentToken)
      throw 'UNEXPECTED_TOKEN ' + this._currentToken.type
    }

    return expr
  }

  expr () {
    const or = this.or()

    const token = this._currentToken

    if (token && token.type === QUESTION_MARK) {
      this.advance()
      const consequent = this.expr()
      this.test(COLON)
      this.advance()
      const alternate = this.expr()
      return new ConditionalExpression(or, consequent, alternate)
    }

    return or
  }

  or () {
    const left = this.and()
    const token = this._currentToken

    if (token && token.type === OR) {
      this.advance()
      const right = this.or()
      return new LogicalExpression(SYMBOL_OR, left, right)
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
      return new LogicalExpression(SYMBOL_AND, left, right)
    }

    return left
  }

  not () {
    const token = this._currentToken

    if (token.type === NOT) {
      this.advance()
      return new UnaryExpression(SYMBOL_NOT, this.factor())
    }

    return this.factor()
  }

  factor () {
    const token = this._currentToken

    if (token.type === PROMISE) {
      return new ItemNode(token.value)
    }

    if (token.type === LPAREN) {
      this.advance()
      const expr = this.expr()
      this.test(RPAREN)
      return expr
    }
  }
}
