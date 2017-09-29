import {
  EMPTY,
  PROMISE,
  OPERATORS
} from './parser'

const UNKNOWN = 'UNKNOWN'
const REGEX_MATCH_OPERATORS = /&&|\|\||[!?:()]/g

const REGEX_SINGLE_LINE_COMMENT = /\/\/\S*(?:\n|\r)/g
const trimAndRemoveComments = str =>
  str
  .replace(REGEX_SINGLE_LINE_COMMENT, '')
  .trim()


function Token (type, value = null) {
  this.type = type
  this.value = value
}


export default class Lexer {
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

    this._operatorGroup = null
    this._operatorGroupPointer = -1
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

  // error (message) {
  //   // TODO
  //   throw message
  // }

  // Lexer
  ////////////////////////////////////////////////////////////////////

  // Reader go to next
  advance () {
    const useOperator = this._useOperatorNext

    const {
      current,
      found
    } = useOperator
      ? this._advanceOperator()
      : this._advancePromise()

    return found
      ? useOperator
        ? new Token(OPERATORS[current] || UNKNOWN, current)
        : new Token(PROMISE, current)
      : null
  }

  _advanceOperator () {
    if (this._operatorGroup) {
      return this._advanceOperatorGroup()
    }

    return this._advanceNormalOperator()
  }

  _advanceOperatorGroup () {
    const index = ++ this._operatorGroupPointer
    const length = this._operatorGroup.length

    let current

    if (index < length) {
      current = this._operatorGroup[index]
    }

    if (index === length - 1) {
      this._operatorGroup = null
      this._operatorGroupPointer = -1
      this._useOperatorNext = false
    }

    return {
      current,
      found: true
    }
  }

  _advanceNormalOperator () {
    const index = ++ this._operatorPointer

    if (index >= this._operatorsLength) {
      return {
        found: false
      }
    }

    const current = this._operators[index]

    // is a single operator
    if (current in OPERATORS) {
      this._useOperatorNext = false

      return {
        current,
        found: true
      }
    }

    const group = current.match(REGEX_MATCH_OPERATORS)

    // Not a valid operator
    // and let parser to deal with the error
    if (!group) {
      this._useOperatorNext = false

      return {
        current,
        found: true
      }
    }

    this._operatorGroup = group
    return this._advanceOperatorGroup()
  }

  _advancePromise () {
    this._useOperatorNext = true

    const index = ++ this._itemsPointer

    if (index < this._itemsLength) {
      return {
        current: this._items[index],
        found: true
      }
    }

    return {
      found: false
    }
  }
}
