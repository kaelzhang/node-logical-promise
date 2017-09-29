import test from 'ava'
import Parser, {
  ItemNode,
  LogicalExpression,
  UnaryExpression,
  ConditionalExpression
} from '../src/parser'
import Lexer from '../src/lexer'
import {
  getArgs
} from './lib/utils'


const join = (array, seperators) => {
  return array.reduce((prev, current, index) => {
    return prev + (
      index !== 0
        ? seperators[index - 1]
        : ''
    ) + current
  }, '')
}


const ast_1and2 = new LogicalExpression('&&', new ItemNode(1), new ItemNode(2))

;[
  ['1 && 2', ast_1and2],
  ['1 && 2 ? 3 : 4', new ConditionalExpression(
    ast_1and2,
    new ItemNode(3),
    new ItemNode(4)
  )],
  ['0 || 1 && 2', new LogicalExpression('||', new ItemNode(0), ast_1and2)],
  ['0', new ItemNode(0)],
  ['(0)', new ItemNode(0)],
  ['2 ? 3 ? 4 : 5 : 6', new ConditionalExpression(
    new ItemNode(2),
    new ConditionalExpression(new ItemNode(3), new ItemNode(4), new ItemNode(5)),
    new ItemNode(6)
  )],
  ['!2', new UnaryExpression('!', new ItemNode(2))],
  ['1 && (2 || 3)', new LogicalExpression(
    '&&',
    new ItemNode(1),
    new LogicalExpression(
      '||',
      new ItemNode(2),
      new ItemNode(3)
    )
  )],
  ['1 ? (2 || 3) : 4', new ConditionalExpression(
    new ItemNode(1),
    new LogicalExpression(
      '||',
      new ItemNode(2),
      new ItemNode(3)
    ),
    new ItemNode(4)
  )],
  ['1 ?', null, null, SyntaxError],
  ['1 ? 2', null, null, SyntaxError],
  ['1 ? 2 a', null, null, SyntaxError],
  ['2 && 3 a', null, null, SyntaxError]
]
.forEach(([code, expect, only, error]) => {
  const [operators, ...items] = getArgs(code)

  ;(only ? test.only : test)(code, async t => {
    const lexer = new Lexer(operators, items)

    let ast
    try {
      ast = new Parser(lexer).parse()
    } catch (e) {
      if (!error) {
        t.fail('should not fail')
      }

      t.is(e instanceof error, true)

      return
    }

    if (error) {
      t.fail('should fail')
      return
    }

    t.deepEqual(JSON.stringify(ast), JSON.stringify(expect))
  })
})
