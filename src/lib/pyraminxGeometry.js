const VERTS = {
  top:  { x: 0, y: -88 },
  fl:   { x: -64, y: 13 },
  fr:   { x: -18, y: 53 },
  back: { x: 82, y: 22 },
}

const FACE_DEFS = {
  F: { verts: [VERTS.top, VERTS.fl, VERTS.fr], shade: 0.51 },
  R: { verts: [VERTS.fr, VERTS.top, VERTS.back], shade: 0.83 },
}

const DRAW_ORDER = ['F', 'R']

function gridPoint(tip, baseL, baseR, row, col) {
  const t = row / 3
  if (row === 0) return { x: tip.x, y: tip.y }
  const lx = tip.x + (baseL.x - tip.x) * t
  const ly = tip.y + (baseL.y - tip.y) * t
  const rx = tip.x + (baseR.x - tip.x) * t
  const ry = tip.y + (baseR.y - tip.y) * t
  const s = col / row
  return { x: lx + (rx - lx) * s, y: ly + (ry - ly) * s }
}

export function getFaceStickers(face) {
  const def = FACE_DEFS[face]
  if (!def) return []

  const [tip, baseL, baseR] = def.verts
  const stickers = []
  let index = 0

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col <= row; col++) {
      stickers.push({
        index,
        points: [
          gridPoint(tip, baseL, baseR, row, col),
          gridPoint(tip, baseL, baseR, row + 1, col),
          gridPoint(tip, baseL, baseR, row + 1, col + 1),
        ],
      })
      index++

      if (col < row) {
        stickers.push({
          index,
          points: [
            gridPoint(tip, baseL, baseR, row, col),
            gridPoint(tip, baseL, baseR, row, col + 1),
            gridPoint(tip, baseL, baseR, row + 1, col + 1),
          ],
        })
        index++
      }
    }
  }

  return stickers
}

export function getVisibleFaces() {
  return DRAW_ORDER
}

export function getPyraFaceShading(face) {
  return FACE_DEFS[face]?.shade ?? 1.0
}
