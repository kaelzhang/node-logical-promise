const REGEX_NUMBER = /\d+/g

export const getArgs = (code, transformer = Number) => {
  const operators = code.split(REGEX_NUMBER)
  const items = code.match(REGEX_NUMBER).map(transformer)
  return [operators, items]
}
