const COS30 = Math.cos(Math.PI / 6)
const SIN30 = Math.sin(Math.PI / 6)

export function projectPoint(x, y, z, scale = 40) {
  const svgX = (x - z) * COS30 * scale
  const svgY = ((x + z) * SIN30 - y) * scale
  return { x: svgX, y: svgY }
}

export function getFaceStickers(face, gridW, gridH, dims) {
  const { x: dw, y: dh, z: dd } = dims
  const stickers = []

  for (let row = 0; row < gridH; row++) {
    for (let col = 0; col < gridW; col++) {
      const corners = getFaceCorners(face, row, col, gridW, gridH, dw, dh, dd)
      stickers.push({
        face,
        row,
        col,
        index: row * gridW + col,
        points: corners,
      })
    }
  }

  return stickers
}

function getFaceCorners(face, row, col, gridW, gridH, dw, dh, dd) {
  const sw = 1 / gridW
  const sh = 1 / gridH

  const c0 = col * sw
  const c1 = (col + 1) * sw
  const r0 = row * sh
  const r1 = (row + 1) * sh

  switch (face) {
    case 'U':
      return [
        projectPoint(c0 * dw, dh, r0 * dd),
        projectPoint(c1 * dw, dh, r0 * dd),
        projectPoint(c1 * dw, dh, r1 * dd),
        projectPoint(c0 * dw, dh, r1 * dd),
      ]
    case 'F':
      return [
        projectPoint(c0 * dw, (1 - r0) * dh, dd),
        projectPoint(c1 * dw, (1 - r0) * dh, dd),
        projectPoint(c1 * dw, (1 - r1) * dh, dd),
        projectPoint(c0 * dw, (1 - r1) * dh, dd),
      ]
    case 'R':
      return [
        projectPoint(dw, (1 - r0) * dh, (1 - c0) * dd),
        projectPoint(dw, (1 - r0) * dh, (1 - c1) * dd),
        projectPoint(dw, (1 - r1) * dh, (1 - c1) * dd),
        projectPoint(dw, (1 - r1) * dh, (1 - c0) * dd),
      ]
    case 'D':
      return [
        projectPoint(c0 * dw, 0, (1 - r0) * dd),
        projectPoint(c1 * dw, 0, (1 - r0) * dd),
        projectPoint(c1 * dw, 0, (1 - r1) * dd),
        projectPoint(c0 * dw, 0, (1 - r1) * dd),
      ]
    case 'B':
      return [
        projectPoint((1 - c0) * dw, (1 - r0) * dh, 0),
        projectPoint((1 - c1) * dw, (1 - r0) * dh, 0),
        projectPoint((1 - c1) * dw, (1 - r1) * dh, 0),
        projectPoint((1 - c0) * dw, (1 - r1) * dh, 0),
      ]
    case 'L':
      return [
        projectPoint(0, (1 - r0) * dh, c0 * dd),
        projectPoint(0, (1 - r0) * dh, c1 * dd),
        projectPoint(0, (1 - r1) * dh, c1 * dd),
        projectPoint(0, (1 - r1) * dh, c0 * dd),
      ]
    default:
      return []
  }
}

export function getVisibleFaces(angle = 'UFR') {
  switch (angle) {
    case 'UFR': return ['U', 'F', 'R']
    case 'UBL': return ['U', 'B', 'L']
    case 'DFR': return ['D', 'F', 'R']
    default: return ['U', 'F', 'R']
  }
}

export function getFaceDimensions(face, dims) {
  const { x: w, y: h, z: d } = dims
  switch (face) {
    case 'U': case 'D': return { gridW: w, gridH: d }
    case 'F': case 'B': return { gridW: w, gridH: h }
    case 'R': case 'L': return { gridW: d, gridH: h }
    default: return { gridW: w, gridH: h }
  }
}
