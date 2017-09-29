import test from 'ava'
import Parser from '../src/parser'


const s = n => Promise.resolve(n)

test('ternary + and', t => {
  const operators = ['', ' && ', '?', ':', '']
  const items = [1, 2, 3, 4]

  // 1 && 2
  //   ? 3
  //   : 4

  const ast = new Parser(operators, items).parse()
  const expect = {
    type: 'ConditionalExpression',
    condition: {
      type: 'LogicalExpression',
      operator: '&&',
      left: {
        type: 'Item',
        item: 1
      },
      right: {
        type: 'Item',
        item: 2
      }
    },
    consequent: {
      type: 'Item',
      item: 3
    },
    alternate: {
      type: 'Item',
      item: 4
    }
  }

  t.deepEqual(JSON.stringify(ast), JSON.stringify(expect))
})
