[![Build Status](https://travis-ci.org/kaelzhang/node-logical-promise.svg?branch=master)](https://travis-ci.org/kaelzhang/node-logical-promise)
[![Coverage](https://codecov.io/gh/kaelzhang/node-logical-promise/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/node-logical-promise)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/node-logical-promise?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/node-logical-promise)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/logical-promise.svg)](http://badge.fury.io/js/logical-promise)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/logical-promise.svg)](https://www.npmjs.org/package/logical-promise)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/node-logical-promise.svg)](https://david-dm.org/kaelzhang/node-logical-promise)
-->

# logical-promise

`logical-promise` uses [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) to perform [logical operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_Operators) on Promises.

`logical-promise` will change the way you write Promises.

Supported operators:

- Logical AND: `&&`
- Logical OR: `||`
- Logical NOT: `!`
- Parenthese: `(` and `)`
- Conditional(ternary) operators: `?` and `:`

## Install

```sh
$ npm install logical-promise
```

## Examples

```js
import logical, {
  FULLFILLED,
  FULLFILLED_AND_TRUE
} from 'logical-promise'

const resolve = n => Promise.resolve(n)
const reject = n => Promise.reject(n)
```

### 1. By default, if rejected, then go into logical `OR`

```js
logical `${reject(1)} || ${resolve(0)}`
// Promise.resolve(0)
```

### 2. Specify condition method. Equivalent to example 1.

```js
logical(FULLFILLED) `${reject(1)} || ${resolve(0)}`
// Promise.resolve(0)
```

### 3. Change the behavior using condition method

```js
logical `
  ${reject(1)}
  || ${resolve(0)}
  || ${resolve(2)}
`
// Promise.resolve(0)

logical(FULLFILLED_AND_TRUE) `
  ${reject(1)}
  || ${resolve(0)}
  || ${reject(2)}
`
// Promise.reject(2)
```

### 4. Uses factory functions that return promises.

```js
import {
  factory
} from 'logical-promise'

factory `
  ${() => Promise.reject(1)}
  && ${() => Promise.resolve(0)}
`
// Promise.reject(1)
```

By using `factory`, we could prevent unnecessary Promise branch from executing. For example:

```js
import delay from 'delay'

let obj
const p1 = () => delay(10).then(() => {
  obj = {a: 1}
})
const p2 = () => obj.a
```

```js
logical `${p1()} && ${p2()}`   // Booooooooooooom !!!
```

If use `factory`:

```js
obj = null

factory `${p1} && ${p2}`       // Promise.resolve(1)
```

### 5. You could also use condition method with `factory`

```js
factory(FULLFILLED_AND_TRUE) `
  ${() => reject(1)}
  || ${() => resolve(0)}
  || ${() => resolve(2)}
`
// Promise.resolve(2)
```

### 6. Ternary operators (`a ? b : c`) are also supported

```js
const f = n => resolve(n)

factory(FULLFILLED_AND_TRUE) `
  ${f(0)}
    ? ${f(1)}
    // We can also write comments here.
    // Even nested ternary operators are supported.
    : ${f(0)}
      ? ${f(2)}
      : ${f(3)} && ${f(4)}
`
// Promise.resolve(4)
```

### 7. `Promise`s are not always required, but it always returns a `Promise`

```js
logical(FULLFILLED_AND_TRUE) `${0} || ${resolve(1)}`
// Promise.resolve(1)

factory(FULLFILLED_AND_TRUE) `${() => 0} || ${() => 1}`
// Promise.resolve(1)
```

## Usage

### logical(operators, ...promises)

```js
logical `template`
logical(condition) `template`
factory `template`
factory(condition) `template`
```

- **condition** `function(promise: Promise): Boolean` The method to check whether a expression should be treated as `true`.

Returns `Promise`

## Built-in condition methods.

### `FULLFILLED`

```js
const FULLFILLED = promise => promise.then(
  () => true,
  () => false
)
```

### `FULLFILLED_AND_TRUE`

```js
const FULLFILLED_AND_TRUE = promise => promise.then(
  result => !!result,
  () => false
)
```

## How does it work

If you have figured it out how [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) works, then it is easy to find out that the example 1 is equivalent to:

```js
// Spaces will be trimmed
logical(['', ' || ', ''], reject(1), resolve(0))
```

Template literals do a great job to tokenize the source code for us 😆 ~

## License

MIT
