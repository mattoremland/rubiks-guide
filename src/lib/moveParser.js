const FACE_COLORS = {
  R: 'bg-red-600',
  L: 'bg-orange-500',
  U: 'bg-white text-gray-900',
  D: 'bg-yellow-400 text-gray-900',
  F: 'bg-green-600',
  B: 'bg-blue-600',
  M: 'bg-purple-600',
  E: 'bg-purple-600',
  S: 'bg-purple-600',
  x: 'bg-gray-600 italic',
  y: 'bg-gray-600 italic',
  z: 'bg-gray-600 italic',
  u: 'bg-gray-200 text-gray-900',
  l: 'bg-orange-300 text-gray-900',
  r: 'bg-red-400',
  b: 'bg-blue-400',
  d: 'bg-yellow-200 text-gray-900',
  f: 'bg-green-400',
  m: 'bg-purple-400',
}

// a digit right before a bracket is a repeat count: 3(R U2) means do (R U2) three times
const MOVE_REGEX = /(\d)(?=\s*\()|(\(|\))|(3[RLUDFB]w|[RLUDFBMESxyz]w?|[ulrbdfm])(['2])?/g

export function parseMoves(notation) {
  if (!notation) return []

  const tokens = []
  let match

  MOVE_REGEX.lastIndex = 0
  while ((match = MOVE_REGEX.exec(notation)) !== null) {
    if (match[1]) {
      tokens.push({ type: 'repeat', value: match[1] })
    } else if (match[2]) {
      tokens.push({ type: 'paren', value: match[2] })
    } else {
      const base = match[3]
      const modifier = match[4] || ''
      const isWide = base.endsWith('w')
      const face = isWide ? base.replace(/^3/, '')[0] : base

      let category = 'face'
      if ('xyz'.includes(face)) category = 'rotation'
      else if ('MES'.includes(face)) category = 'slice'
      else if ('ulrbdfm'.includes(face)) category = 'tip'
      else if (isWide) category = 'wide'

      tokens.push({
        type: 'move',
        base,
        face,
        modifier,
        category,
        display: base + modifier,
        colorClass: FACE_COLORS[face] || 'bg-gray-600',
      })
    }
  }

  return tokens
}
