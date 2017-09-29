import test from 'ava'
import Parser from '../src/parser'


const s = n => Promise.resolve(n)

test('basic', t => {
  const operators = ['', ' && ', '']
  const p1 = s(1)
  const p2 = s(2)
  const items = [p1, p2]

  const ast = new Parser(operators, items).parse()
  console.log(ast)
})
