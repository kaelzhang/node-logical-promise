import {
  SYMBOL_OR
} from './parser'


export default class Runtime {
  constructor (ast, checker, wrapper, testAllBranch) {
    this._ast = ast
    this._checker = checker
    this._wrapper = wrapper
    this._testAll = testAllBranch
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
    .then(bool => !bool)
  }

  LogicalExpression (node) {
    const left = this.node(node.left)

    return this._checker(left)

    //         |         isTrue
    //         |         1  |         0
    // --------------------------------
    // AND: 0  |  right: 1  |  left : 0
    // OR : 1  |  left : 0  |  right: 1
    .then(bool => {

      const useRight = bool ^ node.operator === SYMBOL_OR

      if (useRight) {
        return this.node(node.right)
      }

      // Some unreachable branch might cause an unhandled rejection
      if (this._testAll) {
        return this.check(node.right).then(() => left)
      }

      return left
    })
  }

  ConditionalExpression (node) {
    return this.check(node.condition)
    .then(bool => {
      if (this._testAll) {
        const consequent = this.node(node.consequent)
        const alternate = this.node(node.alternate)
        return bool
          ? this._checker(alternate).then(() => consequent)
          : this._checker(consequent).then(() => alternate)
      }

      return bool
        ? this.node(node.consequent)
        : this.node(node.alternate)
    })
  }
}
