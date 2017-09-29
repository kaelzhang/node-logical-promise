import err from 'err-object'


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
const SYMBOL_QUESTION_MARK = '?'
const SYMBOL_COLON = ':'
const SYMBOL_LPAREN = '('
const SYMBOL_RPAREN = ')'

export const OPERATORS = {
  [SYMBOL_AND]: AND,
  [SYMBOL_OR]: OR,
  [SYMBOL_NOT]: NOT,
  [SYMBOL_QUESTION_MARK]: QUESTION_MARK,
  [SYMBOL_COLON]: COLON,
  [SYMBOL_LPAREN]: LPAREN,
  [SYMBOL_RPAREN]: RPAREN
}

const SYMBOL_OPERSTORS = {
  [AND]: SYMBOL_AND,
  [OR]: SYMBOL_OR,
  [NOT]: SYMBOL_NOT,
  [QUESTION_MARK]: SYMBOL_QUESTION_MARK,
  [COLON]: SYMBOL_COLON,
  [LPAREN]: SYMBOL_LPAREN,
  [RPAREN]: SYMBOL_RPAREN
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
    const token = this._currentToken

    if (!token) {
      throw err({
        message: `unexpected end of input, "${SYMBOL_OPERSTORS[type]}" expected.`
      }, SyntaxError)
    }

    if (token.type !== type) {
      throw err({
        message: `unexpected token "${token.value}", "${SYMBOL_OPERSTORS[type]}" expected.`
      }, SyntaxError)
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

    if (this._currentToken) {
      throw err({
        message: `unexpected token "${this._currentToken.value}".`
      }, SyntaxError)
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

    if (token && token.type === NOT) {
      this.advance()
      return new UnaryExpression(SYMBOL_NOT, this.factor())
    }

    return this.factor()
  }

  factor () {
    const token = this._currentToken

    if (!token) {
      throw err({
        message: 'unexpected end of input.'
      }, SyntaxError)
    }

    if (token.type === PROMISE) {
      return new ItemNode(token.value)
    }

    if (token.type === LPAREN) {
      this.advance()
      const expr = this.expr()
      this.test(RPAREN)
      return expr
    }

    throw err({
      message: `unexpected token "${token.value}"`
    }, SyntaxError)
  }
}
