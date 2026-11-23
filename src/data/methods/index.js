import { pyraminxMethod } from './pyraminx'

const methods = {
  pyraminx: pyraminxMethod,
}

export function getMethod(puzzleSlug) {
  return methods[puzzleSlug] || null
}
