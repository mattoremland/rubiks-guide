import { arrowPaths, labelBeyond } from './arrowHead.js'

const EDGE = 150
const H = EDGE * Math.sqrt(2 / 3)
const CIRC_R = EDGE / Math.sqrt(3)

const V = {
  apex: [0, H * 0.75, 0],
  fl: [-EDGE / 2, -H * 0.25, -CIRC_R * 0.5],
  fr: [EDGE / 2, -H * 0.25, -CIRC_R * 0.5],
  back: [0, -H * 0.25, CIRC_R],
}
const VERT_R = Math.hypot(...V.apex)

// [tip, base-left, base-right]; must match the sticker indexing in pyraminxGeometry.js
const FACE_KEYS = {
  F: ['apex', 'fl', 'fr'],
  L: ['fl', 'back', 'apex'],
  R: ['fr', 'apex', 'back'],
  D: ['fl', 'fr', 'back'],
}

// Fraction of an edge, from the turning vertex, that each layer covers ('all' rotates the whole puzzle).
const LAYER_DEPTH = { tip: 1 / 3, big: 2 / 3, all: 4 / 3 }

// Camera angles in degrees.
export const DEFAULT_VIEW = { x: -16, y: 72 }

const add = (a, b) => a.map((x, i) => x + b[i])
const sub = (a, b) => a.map((x, i) => x - b[i])
const scale = (a, s) => a.map(x => x * s)
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const unit = (a) => scale(a, 1 / Math.hypot(...a))
const lerp = (a, b, t) => add(a, scale(sub(b, a), t))

function rotateAbout(p, axis, angle) {
  const c = Math.cos(angle), s = Math.sin(angle)
  return add(add(scale(p, c), scale(cross(axis, p), s)), scale(axis, dot(axis, p) * (1 - c)))
}

// The camera looks along +z with x to the right, so the drawing is a mirror image of the model:
// a turn with dir +1 (counterclockwise in the model) looks clockwise on screen.
function toView(p, view) {
  const ay = view.y * Math.PI / 180, ax = view.x * Math.PI / 180
  const cy = Math.cos(ay), sy = Math.sin(ay)
  const q = [p[0] * cy + p[2] * sy, p[1], -p[0] * sy + p[2] * cy]
  const cx = Math.cos(ax), sx = Math.sin(ax)
  return [q[0], q[1] * cx - q[2] * sx, q[1] * sx + q[2] * cx]
}

const to2d = (p) => ({ x: p[0], y: -p[1] })

function shadeFor(n) {
  const l = [0.3, 0.8, -0.5]
  const d = dot(n, l) / ((Math.hypot(...n) || 1) * Math.hypot(...l))
  return 0.45 + 0.55 * Math.max(0, d)
}

function gridPoint(tip, bl, br, row, col) {
  if (row === 0) return tip
  return lerp(lerp(tip, bl, row / 3), lerp(tip, br, row / 3), col / row)
}

const STICKERS = []
const FACE_NORMAL = {}
for (const [face, keys] of Object.entries(FACE_KEYS)) {
  const [tip, bl, br] = keys.map(k => V[k])
  let n = cross(sub(bl, tip), sub(br, tip))
  if (dot(n, tip) < 0) n = scale(n, -1)
  FACE_NORMAL[face] = unit(n)
  let index = 0
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col <= row; col++) {
      const tris = [[gridPoint(tip, bl, br, row, col), gridPoint(tip, bl, br, row + 1, col), gridPoint(tip, bl, br, row + 1, col + 1)]]
      if (col < row) tris.push([gridPoint(tip, bl, br, row, col), gridPoint(tip, bl, br, row, col + 1), gridPoint(tip, bl, br, row + 1, col + 1)])
      for (const pts of tris) {
        const centroid = scale(pts.reduce(add), 1 / 3)
        STICKERS.push({ face, index: index++, pts, centroid })
      }
    }
  }
}

function layerOf(vertex, layer) {
  const axis = unit(V[vertex])
  const f = LAYER_DEPTH[layer]
  const threshold = VERT_R - f * (4 * VERT_R / 3)
  const others = Object.keys(V).filter(k => k !== vertex)
  return {
    axis,
    inLayer: (s) => dot(s.centroid, axis) > threshold,
    cut: others.map(k => lerp(V[vertex], V[k], f)),
  }
}

// State after turning a layer one step (120°) in the direction of `dir` (+1 / -1).
export function applyTurn(state, vertex, layer, dir) {
  const { axis, inLayer } = layerOf(vertex, layer)
  const next = Object.fromEntries(Object.entries(state).map(([k, v]) => [k, [...v]]))
  for (const s of STICKERS) {
    if (!inLayer(s)) continue
    const p = rotateAbout(s.centroid, axis, dir * 2 * Math.PI / 3)
    let best, bestD = Infinity
    for (const t of STICKERS) {
      const d = Math.hypot(...sub(t.centroid, p))
      if (d < bestD) { bestD = d; best = t }
    }
    next[best.face][best.index] = state[s.face][s.index]
  }
  return next
}

function visiblePolys(polys, view) {
  const out = []
  for (const p of polys) {
    const n = toView(p.normal, view)
    if (n[2] >= 0) continue
    out.push({ points: p.pts.map(q => to2d(toView(q, view))), color: p.color, shade: shadeFor(n), face: p.face, index: p.index })
  }
  return out
}

// Polygons, back to front, for the puzzle with one layer turned by `angle` radians.
// `color` is a sticker code, or null for the exposed inner plastic.
export function getTurnPolygons(state, vertex, layer, angle, view = DEFAULT_VIEW) {
  const { axis, inLayer, cut } = layerOf(vertex, layer)
  const body = [{ pts: cut, normal: axis, color: null }]
  const chunk = [{ pts: cut.map(p => rotateAbout(p, axis, angle)), normal: scale(axis, -1), color: null }]
  for (const s of STICKERS) {
    const base = { face: s.face, index: s.index, color: state[s.face][s.index] }
    if (inLayer(s)) {
      chunk.push({ ...base, pts: s.pts.map(p => rotateAbout(p, axis, angle)), normal: rotateAbout(FACE_NORMAL[s.face], axis, angle) })
    } else {
      body.push({ ...base, pts: s.pts, normal: FACE_NORMAL[s.face] })
    }
  }
  const chunkInFront = toView(axis, view)[2] < 0
  const [first, second] = chunkInFront ? [body, chunk] : [chunk, body]
  return [...visiblePolys(first, view), ...visiblePolys(second, view)]
}

// 2D point just beyond a corner, for placing a label.
export function getCornerLabelPoint(vertex, view = DEFAULT_VIEW) {
  return to2d(toView(scale(V[vertex], 1.22), view))
}

// 2D bounds of the whole puzzle from this view.
export function getViewBounds(view = DEFAULT_VIEW) {
  const pts = Object.values(V).map(p => to2d(toView(p, view)))
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y)
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) }
}

// Polygons, back to front, for the puzzle at rest.
export function getPuzzlePolygons(state, view = DEFAULT_VIEW) {
  return getTurnPolygons(state, 'apex', 'tip', 0, view)
}

function hull(points) {
  const pts = [...points].sort((a, b) => a.x - b.x || a.y - b.y)
  const turn = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  const build = (list) => {
    const h = []
    for (const p of list) {
      while (h.length >= 2 && turn(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop()
      h.push(p)
    }
    h.pop()
    return h
  }
  return [...build(pts), ...build([...pts].reverse())]
}

// Outline of a corner layer's stickers on the faces facing the viewer.
export function getLayerOutline(vertex, layer, view = DEFAULT_VIEW) {
  const f = LAYER_DEPTH[layer]
  const pts = [V[vertex]]
  for (const [face, keys] of Object.entries(FACE_KEYS)) {
    if (!keys.includes(vertex) || toView(FACE_NORMAL[face], view)[2] >= 0) continue
    for (const k of keys) if (k !== vertex) pts.push(lerp(V[vertex], V[k], f))
  }
  return hull(pts.map(p => to2d(toView(p, view))))
}

// Outline of the band below the top corner's layer (the bottom third) across the side faces in view.
export function getBottomBandOutline(view = DEFAULT_VIEW) {
  const sides = Object.entries(FACE_KEYS)
    .filter(([face, keys]) => keys.includes('apex') && toView(FACE_NORMAL[face], view)[2] < 0)
    .map(([, keys]) => keys.filter(k => k !== 'apex'))
  if (!sides.length) return []
  let chain = sides[0]
  if (sides.length > 1) {
    const shared = sides[0].find(k => sides[1].includes(k))
    chain = [sides[0].find(k => k !== shared), shared, sides[1].find(k => k !== shared)]
  }
  const cut = (k) => lerp(V.apex, V[k], 2 / 3)
  const pts = [...chain.map(k => V[k]), ...[...chain].reverse().map(cut)]
  return pts.map(p => to2d(toView(p, view)))
}

// Outline around a group of stickers on one face, in their resting positions.
export function getStickerGroupOutline(face, indices, view = DEFAULT_VIEW) {
  const pts = STICKERS
    .filter(s => s.face === face && indices.includes(s.index))
    .flatMap(s => s.pts)
  return hull(pts.map(p => to2d(toView(p, view))))
}

// Arrow along the front of a ring just beyond the turning vertex, pointing the way the layer turns.
export function getTurnArrow(vertex, dir, view = DEFAULT_VIEW) {
  const axis = unit(V[vertex])
  const center = scale(axis, VERT_R + 14)
  const helper = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
  const e1 = unit(cross(helper, axis))
  const e2 = cross(axis, e1)
  const rho = 24
  const at = (t) => toView(add(center, add(scale(e1, rho * Math.cos(t)), scale(e2, rho * Math.sin(t)))), view)
  let front = 0, minZ = Infinity
  for (let deg = 0; deg < 360; deg += 2) {
    const z = at(deg * Math.PI / 180)[2]
    if (z < minZ) { minZ = z; front = deg }
  }
  const pts = []
  for (let k = -115; k <= 115; k += 5) pts.push(to2d(at((front + dir * k) * Math.PI / 180)))
  return arrowPaths(pts)
}

// A move's name with the F face in front: U, L, R, B for the corners (lowercase for a tip alone),
// ' for counterclockwise.
export const turnName = (m) => {
  const letter = { apex: 'U', fl: 'L', fr: 'R', back: 'B' }[m.vertex]
  return (m.layer === 'tip' ? letter.toLowerCase() : letter) + (m.dir < 0 ? "'" : '')
}

// Where to write a move's letter: beside the turning corner, past its turn arrow.
export function getTurnLabelPoint(vertex, dir, view = DEFAULT_VIEW, gap = 18) {
  const corners = Object.values(V).map(p => to2d(toView(p, view)))
  return labelBeyond(to2d(toView(V[vertex], view)), [...corners, ...getTurnArrow(vertex, dir, view).points], gap)
}
