export function createSolvedState(dims) {
  const { x: w, y: h, z: d } = dims
  return {
    U: Array(w * d).fill('W'),
    D: Array(w * d).fill('Y'),
    F: Array(w * h).fill('G'),
    B: Array(w * h).fill('B'),
    R: Array(d * h).fill('R'),
    L: Array(d * h).fill('O'),
  }
}

export function getSticker(state, face, index) {
  if (!state || !state[face]) return 'X'
  return state[face][index] || 'X'
}

export function getHighlight(highlights, face, index) {
  if (!highlights) return null
  const key = `${face}:${index}`
  const wildcard = `${face}:*`
  return highlights[key] || highlights[wildcard] || null
}
