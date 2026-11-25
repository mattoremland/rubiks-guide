import { pyraminxMethod } from './pyraminx'
import { twoByTwoMethod } from './twoByTwo'
import { threeByThreeByTwoMethod } from './threeByThreeByTwo'
import { twoByTwoByThreeMethod } from './twoByTwoByThree'
import { threeByThreeMethod } from './threeByThree'
import { fourByFourMethod } from './fourByFour'

const methods = {
  pyraminx: pyraminxMethod,
  '2x2': twoByTwoMethod,
  '2x2x3': twoByTwoByThreeMethod,
  '3x3x2': threeByThreeByTwoMethod,
  '3x3': threeByThreeMethod,
  '4x4': fourByFourMethod,
}

export function getMethod(puzzleSlug) {
  return methods[puzzleSlug] || null
}
