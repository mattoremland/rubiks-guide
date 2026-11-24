import { pyraminxMethod } from './pyraminx'
import { twoByTwoMethod } from './twoByTwo'
import { threeByThreeByTwoMethod } from './threeByThreeByTwo'
import { twoByTwoByThreeMethod } from './twoByTwoByThree'

const methods = {
  pyraminx: pyraminxMethod,
  '2x2': twoByTwoMethod,
  '2x2x3': twoByTwoByThreeMethod,
  '3x3x2': threeByThreeByTwoMethod,
}

export function getMethod(puzzleSlug) {
  return methods[puzzleSlug] || null
}
