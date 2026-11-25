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
}

const MOVE_REGEX = /(\(|\))|([RLUDFBMESxyz]w?|[ulrbdf])(['2])?/g

export function parseMoves(notation) {
  if (!notation) return []

  const tokens = []
  let match

  MOVE_REGEX.lastIndex = 0
  while ((match = MOVE_REGEX.exec(notation)) !== null) {
    if (match[1]) {
      tokens.push({ type: 'paren', value: match[1] })
    } else {
      const base = match[2]
      const modifier = match[3] || ''
      const isWide = base.endsWith('w')
      const face = isWide ? base[0] : base

      let category = 'face'
      if ('xyz'.includes(face)) category = 'rotation'
      else if ('MES'.includes(face)) category = 'slice'
      else if ('ulrbdf'.includes(face)) category = 'tip'
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
