import {
  SYMBOL_OR
} from './parser'


export default class Runtime {
  constructor (ast, checker, wrapper) {
    this._ast = ast
    this._checker = checker
    this._wrapper = wrapper
  }

  process () {
    return this.node(this._ast)
  }

  node (node) {
    return this[node.type](node)
  }

  check (node) {
    return this._checker(this.node(node))
  }

  Item (node) {
    return this._wrapper(node.item)
  }

  UnaryExpression (node) {
    return this.check(node.argument)
  }

  LogicalExpression (node) {
    const left = this.node(node.left)

    return this._checker(left)
    .then(isTrue => {

      //         |         isTrue
      //         |         1  |         0
      // --------------------------------
      // AND: 0  |  right: 1  |  left : 0
      // OR : 1  |  left : 0  |  right: 1
      return isTrue ^ node.operator === SYMBOL_OR
        ? this.node(node.right)
        : left
    })
  }

  ConditionalExpression (node) {
    return this.check(node.condition)
    .then(isTrue => {
      return isTrue
        ? this.node(node.consequent)
        : this.node(node.alternate)
    })
  }
}
