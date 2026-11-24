import { pyraminxMethod } from './pyraminx'
import { twoByTwoMethod } from './twoByTwo'
import { threeByThreeByTwoMethod } from './threeByThreeByTwo'

const methods = {
  pyraminx: pyraminxMethod,
  '2x2': twoByTwoMethod,
  '3x3x2': threeByThreeByTwoMethod,
}

export function getMethod(puzzleSlug) {
  return methods[puzzleSlug] || null
}
