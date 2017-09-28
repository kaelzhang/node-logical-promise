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
```

#### 1. By default, if rejected, then go into `OR`

```js
logical `${Promise.reject(1)} || ${Promise.resolve(0)}`
// Promise.resolve(0)
```

#### 2. Specify condition method. Equivalent to example 1.

```js
logical(FULLFILLED) `${Promise.reject(1)} || ${Promise.resolve(0)}`
// Promise.resolve(0)
```

#### 3. Change the behavior using condition method

```js
logical `
  ${Promise.reject(1)}
  || ${Promise.resolve(0)}
  || ${Promise.resolve(2)}
`
// Promise.resolve(0)

logical(FULLFILLED_AND_TRUE) `
  ${Promise.reject(1)}
  || ${Promise.resolve(0)}
  || ${Promise.reject(2)}
`
// Promise.reject(2)
```

#### 4. Uses factory functions that return promises.

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

#### 5. You could also use condition method with `factory`

```js
factory(FULLFILLED_AND_TRUE) `
  ${() => Promise.reject(1)}
  || ${() => Promise.resolve(0)}
  || ${() => Promise.resolve(2)}
`
// Promise.resolve(2)
```

#### 6. Ternary operators (`a ? b : c`) are also supported

```js
const f = n => Promise.resolve(n)

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

#### 7. `Promise`s are not always required, but it always returns a `Promise`

```js
logical(FULLFILLED_AND_TRUE) `${0} || ${Promise.resolve(1)}`
// Promise.resolve(1)

factory(FULLFILLED_AND_TRUE) `${() => 0} || ${() => 1}`
// Promise.resolve(1)
```

## Usage

### logical `template`
### logical(condition) `template`
### factory `template`
### factory(condition) `template`

- **condition** `function(promise: Promise): Boolean` The method to check whether a expression should be treated as `true`.

## License

MIT
