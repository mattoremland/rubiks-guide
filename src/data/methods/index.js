import { pyraminxMethod } from './pyraminx'
import { twoByTwoMethod } from './twoByTwo'

const methods = {
  pyraminx: pyraminxMethod,
  '2x2': twoByTwoMethod,
}

export function getMethod(puzzleSlug) {
  return methods[puzzleSlug] || null
}
