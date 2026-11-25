import { arrowPaths, labelBeyond } from './arrowHead.js'

// 3D model, move simulator and projection for cubes and cuboids (e.g. 2x2x2, 3x3x2).
// Model axes: x right, y up, z toward the viewer (front). The camera looks along -z with x to the
// right, so the drawing is not mirrored: a clockwise move looks clockwise on screen.
// Shapes are { x, y, z } piece counts (width, height, depth). Every piece is the same size, and the
// longest side spans -1..1.

const FACES = {
  // normal, top-left corner of the face as you look at it (as signs), then "right" and "down" along it
  U: { n: [0, 1, 0], o: [-1, 1, -1], right: [1, 0, 0], down: [0, 0, 1], cols: 'x', rows: 'z' },
  D: { n: [0, -1, 0], o: [-1, -1, 1], right: [1, 0, 0], down: [0, 0, -1], cols: 'x', rows: 'z' },
  F: { n: [0, 0, 1], o: [-1, 1, 1], right: [1, 0, 0], down: [0, -1, 0], cols: 'x', rows: 'y' },
  B: { n: [0, 0, -1], o: [1, 1, -1], right: [-1, 0, 0], down: [0, -1, 0], cols: 'x', rows: 'y' },
  R: { n: [1, 0, 0], o: [1, 1, 1], right: [0, 0, -1], down: [0, -1, 0], cols: 'z', rows: 'y' },
  L: { n: [-1, 0, 0], o: [-1, 1, -1], right: [0, 0, 1], down: [0, -1, 0], cols: 'z', rows: 'y' },
}
const ROTATION_AXIS = { x: 'R', y: 'U', z: 'F' }
const AXES = ['x', 'y', 'z']

export const DEFAULT_CUBE_VIEW = { x: 25, y: 35 }
export const SOLVED_COLORS = { U: 'W', D: 'Y', F: 'G', B: 'B', R: 'R', L: 'O' }
const SIZE_PX = 100

const add = (a, b) => a.map((x, i) => x + b[i])
const sub = (a, b) => a.map((x, i) => x - b[i])
const scale = (a, s) => a.map(x => x * s)
const mul = (a, b) => a.map((x, i) => x * b[i])
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const unit = (a) => scale(a, 1 / Math.hypot(...a))

function rotateAbout(p, axis, angle) {
  const c = Math.cos(angle), s = Math.sin(angle)
  return add(add(scale(p, c), scale(cross(axis, p), s)), scale(axis, dot(axis, p) * (1 - c)))
}

// view.x tilts the top toward the camera; view.y turns the right face toward the camera; view.z
// (optional) rolls the picture counterclockwise on screen (degrees).
function toView(p, view) {
  const b = -view.y * Math.PI / 180, a = view.x * Math.PI / 180, c = (view.z ?? 0) * Math.PI / 180
  const q = [p[0] * Math.cos(b) + p[2] * Math.sin(b), p[1], -p[0] * Math.sin(b) + p[2] * Math.cos(b)]
  const r = [q[0], q[1] * Math.cos(a) - q[2] * Math.sin(a), q[1] * Math.sin(a) + q[2] * Math.cos(a)]
  return [r[0] * Math.cos(c) - r[1] * Math.sin(c), r[0] * Math.sin(c) + r[1] * Math.cos(c), r[2]]
}

function shadeFor(viewNormal) {
  const l = unit([0.35, 0.8, 0.5])
  return 0.68 + 0.32 * Math.max(0, dot(unit(viewNormal), l))
}

// A shape as { x, y, z } piece counts; a plain number n means an n x n x n cube.
const toDims = (d) => (typeof d === 'number' ? { x: d, y: d, z: d } : d)

// Piece counts of a sticker state, from the sizes of its U, F and R faces.
export function dimsOf(state) {
  const a = state.U.length, b = state.F.length, c = state.R.length
  const x = Math.round(Math.sqrt(a * b / c))
  return { x, y: Math.round(b / x), z: Math.round(a / x) }
}

const models = {}

function model(dimsIn) {
  const dims = toDims(dimsIn)
  const key = `${dims.x}x${dims.y}x${dims.z}`
  if (models[key]) return models[key]
  const step = 2 / Math.max(dims.x, dims.y, dims.z)
  const half = AXES.map(a => dims[a] * step / 2)
  const stickers = []
  for (const [face, f] of Object.entries(FACES)) {
    const cols = dims[f.cols], rows = dims[f.rows]
    const o = mul(f.o, half)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const at = (dr, dc) => add(o, add(scale(f.right, (c + dc) * step), scale(f.down, (r + dr) * step)))
        const pts = [at(0, 0), at(0, 1), at(1, 1), at(1, 0)]
        stickers.push({ face, index: r * cols + c, pts, centroid: scale(pts.reduce(add), 1 / 4) })
      }
    }
  }
  models[key] = { dims, step, half, stickers }
  return models[key]
}

export function solvedState(dimsIn) {
  const dims = toDims(dimsIn)
  return Object.fromEntries(Object.entries(SOLVED_COLORS).map(([f, c]) => [f, Array(dims[FACES[f].cols] * dims[FACES[f].rows]).fill(c)]))
}

const axisIndex = (axis) => axis.findIndex(v => v !== 0)

// Whether a layer turning about this axis can stop at a quarter turn (its cross-section is square).
function quarterTurns(dims, axis) {
  const [a, b] = AXES.filter((_, k) => k !== axisIndex(axis))
  return dims[a] === dims[b]
}

// Middle-layer moves turn the same way as the face named here. M is the middle horizontal layer
// (on a 2x2x3 tower), turning like D: counterclockwise as seen from above.
const SLICES = { M: 'D' }

const faceAxis = (face) => FACES[ROTATION_AXIS[face] ?? SLICES[face] ?? face].n

// "R U R' U2 x2'" -> [{ face: 'R', turns: 1 }, ...]; turns: 1 clockwise, -1 counterclockwise,
// 2 half turn clockwise, -2 half turn counterclockwise (same result, opposite direction on screen).
// Bigger cubes: Rw turns the outer two layers on the right together (`layers: [1, 2]`, counted in
// from the face); a lowercase letter turns only the inner slice next to that face (r is the second
// layer from the right, `layers: [2, 2]`). They turn the same way as the face move.
// With `dims`, a face that can only make half turns (like R on a 3x3x2) turns 180° for R and R'.
export function parseAlg(alg, dims) {
  const TURNS = { '': 1, "'": -1, 2: 2, "2'": -2 }
  return [...alg.matchAll(/([RLUDFBMxyz]w?|[rludfb])(2'|2|')?/g)].map(([, name, mod]) => {
    let face = name, layers
    if (name.endsWith('w')) { face = name[0]; layers = [1, 2] }
    else if (/[rludfb]/.test(name)) { face = name.toUpperCase(); layers = [2, 2] }
    let turns = TURNS[mod ?? '']
    if (dims && Math.abs(turns) === 1 && !quarterTurns(toDims(dims), faceAxis(face))) turns *= 2
    return layers ? { face, turns, layers } : { face, turns }
  })
}

const TURN_MARK = { 1: '', [-1]: "'", 2: '2', [-2]: "2'" }
export const moveName = (m) => {
  const [from, to] = m.layers ?? [1, 1]
  const base = from === 2 && to === 2 ? m.face.toLowerCase() : to > 1 ? `${m.face}w` : m.face
  return base + TURN_MARK[m.turns]
}

// Clockwise, seen from outside the face, is a negative rotation about its outward normal.
export const moveAngle = (m) => -m.turns * Math.PI / 2

// The turning layer: the stickers whose distance along `axis` is between `lo` and `hi`
// (the whole puzzle for x / y / z; the middle layer, of a puzzle 3 pieces tall, for slice moves).
function layerOf(dims, move) {
  const { step, half } = model(dims)
  const axis = faceAxis(move.face)
  const whole = move.face in ROTATION_AXIS
  const extent = half[axisIndex(axis)]
  // `layers` [from, to] counts layers in from the face (1 = the face itself)
  const [from, to] = move.layers ?? [1, 1]
  const [lo, hi] = move.face in SLICES ? [-step / 2, step / 2] : [extent - to * step, extent - (from - 1) * step]
  // stickers on the turning face itself sit exactly at `hi`, so that end is inclusive
  const inLayer = (s) => whole || (dot(s.centroid, axis) > lo + 1e-9 && dot(s.centroid, axis) < hi + 1e-9)
  return { axis, whole, extent, lo, hi, inLayer }
}

export function applyMove(state, move) {
  const dims = dimsOf(state)
  const { stickers } = model(dims)
  const { axis, inLayer } = layerOf(dims, move)
  const angle = moveAngle(move)
  const next = Object.fromEntries(Object.entries(state).map(([k, v]) => [k, [...v]]))
  for (const s of stickers) {
    if (!inLayer(s)) continue
    const p = rotateAbout(s.centroid, axis, angle)
    let best, bestD = Infinity
    for (const t of stickers) {
      const d = Math.hypot(...sub(t.centroid, p))
      if (d < bestD) { bestD = d; best = t }
    }
    next[best.face][best.index] = state[s.face][s.index]
  }
  return next
}

export const applyAlg = (state, alg) => parseAlg(alg, dimsOf(state)).reduce(applyMove, state)

const to2d = (p) => ({ x: p[0] * SIZE_PX / 2, y: -p[1] * SIZE_PX / 2 })

// The rectangle where a turning layer separates from the rest of the puzzle.
function cutRect(dims, axis, at) {
  const { half } = model(dims)
  const i = axisIndex(axis)
  const [a, b] = [0, 1, 2].filter(k => k !== i)
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => {
    const p = [0, 0, 0]
    p[i] = axis[i] * at
    p[a] = u * half[a]
    p[b] = v * half[b]
    return p
  })
}

function visiblePolys(polys, view) {
  const out = []
  for (const p of polys) {
    const nv = toView(p.normal, view)
    if (nv[2] <= 1e-9) continue
    out.push({ points: p.pts.map(q => to2d(toView(q, view))), color: p.color, shade: shadeFor(nv), face: p.face, index: p.index })
  }
  return out
}

// Polygons, back to front, for the puzzle with one move part-way through (`angle` radians).
// `color` is a sticker code, or null for the exposed inside of the puzzle.
export function getTurnPolygons(state, move, angle, view = DEFAULT_CUBE_VIEW) {
  const dims = dimsOf(state)
  const { stickers } = model(dims)
  const { axis, whole, extent, lo, hi, inLayer } = move ? layerOf(dims, move) : { whole: true, inLayer: () => true }
  // the puzzle splits into the part below the layer (along `axis`), the layer, and the part above
  const below = []
  const layer = []
  const above = []
  const turned = (pts) => pts.map(p => rotateAbout(p, axis, angle))
  if (move && !whole) {
    if (lo > -extent + 1e-9) {
      below.push({ pts: cutRect(dims, axis, lo), normal: axis, color: null })
      layer.push({ pts: turned(cutRect(dims, axis, lo)), normal: rotateAbout(scale(axis, -1), axis, angle), color: null })
    }
    if (hi < extent - 1e-9) {
      above.push({ pts: cutRect(dims, axis, hi), normal: scale(axis, -1), color: null })
      layer.push({ pts: turned(cutRect(dims, axis, hi)), normal: axis, color: null })
    }
  }
  for (const s of stickers) {
    const base = { face: s.face, index: s.index, color: state[s.face][s.index] }
    const fn = FACES[s.face].n
    if (move && inLayer(s)) layer.push({ ...base, pts: turned(s.pts), normal: rotateAbout(fn, axis, angle) })
    else if (!move || whole || dot(s.centroid, axis) < lo) below.push({ ...base, pts: s.pts, normal: fn })
    else above.push({ ...base, pts: s.pts, normal: fn })
  }
  // back to front: the part furthest from the camera along the turning axis first
  const order = !move || whole || toView(axis, view)[2] > 0 ? [below, layer, above] : [above, layer, below]
  return order.flatMap(part => visiblePolys(part, view))
}

export const getCubePolygons = (state, view = DEFAULT_CUBE_VIEW) => getTurnPolygons(state, null, 0, view)

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

const boxCorners = (dims) => {
  const { half } = model(dims)
  return [-1, 1].flatMap(x => [-1, 1].flatMap(y => [-1, 1].map(z => mul([x, y, z], half))))
}

// The 12 edges of a box from `lo` to `hi`. An edge is visible if it borders a side of the box
// that lies on the outside of the puzzle and faces the camera.
function boxEdges(dims, lo, hi, view) {
  const { half } = model(dims)
  const onSurface = (normal) => normal.some((v, k) => (v > 0 && hi[k] >= half[k] - 1e-9) || (v < 0 && lo[k] <= -half[k] + 1e-9))
  const faceSeen = (normal) => onSurface(normal) && toView(normal, view)[2] > 1e-9
  const edges = []
  for (let k = 0; k < 3; k++) {
    const [a, b] = [0, 1, 2].filter(j => j !== k)
    for (const sa of [0, 1]) for (const sb of [0, 1]) {
      const p = [0, 0, 0], q = [0, 0, 0]
      p[a] = q[a] = sa ? hi[a] : lo[a]
      p[b] = q[b] = sb ? hi[b] : lo[b]
      p[k] = lo[k]
      q[k] = hi[k]
      const na = [0, 0, 0], nb = [0, 0, 0]
      na[a] = sa ? 1 : -1
      nb[b] = sb ? 1 : -1
      edges.push({
        from: to2d(toView(p, view)),
        to: to2d(toView(q, view)),
        visible: faceSeen(na) || faceSeen(nb),
      })
    }
  }
  return edges
}

// Box edges of the layer a move turns (the whole puzzle for x / y / z).
export function getMoveOutlineEdges(dims, move, view = DEFAULT_CUBE_VIEW) {
  const { half } = model(dims)
  const layer = layerOf(dims, move)
  const lo = scale(half, -1), hi = [...half]
  if (!layer.whole) {
    const i = axisIndex(layer.axis)
    const s = layer.axis[i]
    ;[lo[i], hi[i]] = s > 0 ? [layer.lo, layer.hi] : [-layer.hi, -layer.lo]
  }
  return boxEdges(dims, lo, hi, view)
}

// Box edges of one piece, or of a block of pieces `size` [columns, rows, depth] across.
// `at` is [column from left, row from bottom, depth from back], from 0.
export function getPieceEdges(dims, at, view = DEFAULT_CUBE_VIEW, size = [1, 1, 1]) {
  const { step, half } = model(dims)
  const lo = at.map((i, k) => -half[k] + i * step)
  return boxEdges(dims, lo, lo.map((v, k) => v + size[k] * step), view)
}

// Outline around a group of stickers on one face.
export function getStickerGroupOutline(dims, face, indices, view = DEFAULT_CUBE_VIEW) {
  const pts = model(dims).stickers.filter(s => s.face === face && indices.includes(s.index)).flatMap(s => s.pts)
  return hull(pts.map(p => to2d(toView(p, view))))
}

// A short arrow pointing straight out of a group of stickers, showing which way they face.
export function getStickerFacingArrow(dims, face, indices, view = DEFAULT_CUBE_VIEW) {
  const group = model(dims).stickers.filter(s => s.face === face && indices.includes(s.index))
  const center = scale(group.map(s => s.centroid).reduce(add), 1 / group.length)
  return { from: to2d(toView(center, view)), to: to2d(toView(add(center, scale(FACES[face].n, 0.75)), view)) }
}

export function getViewBounds(view = DEFAULT_CUBE_VIEW, dims = 2) {
  const pts = boxCorners(dims).map(p => to2d(toView(p, view)))
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y)
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) }
}

// Whether a face can be seen from this view.
export const isFaceVisible = (face, view = DEFAULT_CUBE_VIEW) => toView(FACES[face].n, view)[2] > 1e-9

const faceCenter = (dims, face) => mul(FACES[face].n, model(dims).half)

// The center of a face, for a label.
export function getFaceLabelPoint(face, view = DEFAULT_CUBE_VIEW, dims = 2) {
  return to2d(toView(faceCenter(dims, face), view))
}

// Label for a face hidden from this view: text beside the puzzle, level with the edge nearest that
// face, and an arrow from the text to that edge. `side` ('left' / 'right') overrides which side.
export function getHiddenFaceLabel(face, view = DEFAULT_CUBE_VIEW, side, dims = 2) {
  const c = to2d(toView(faceCenter(dims, face), view))
  const len = Math.hypot(c.x, c.y) || 1
  const out = { x: c.x / len, y: c.y / len }
  const corners = boxCorners(dims).map(p => to2d(toView(p, view)))
  // the two outline corners furthest toward the hidden face; aim at the middle of the edge between them
  const [a, b] = [...corners].sort((p, q) => (q.x * out.x + q.y * out.y) - (p.x * out.x + p.y * out.y))
  const target = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  // put the text beside the puzzle, below that edge, so it stays clear of a turn arrow
  // drawn straight out from the face
  const xs = corners.map(p => p.x)
  const left = side ? side === 'left' : target.x <= 0
  const text = { x: left ? Math.min(...xs) - 42 : Math.max(...xs) + 42, y: target.y + 24 }
  const dx = target.x - text.x, dy = target.y - text.y
  const d = Math.hypot(dx, dy) || 1
  const along = (k) => ({ x: text.x + dx / d * k, y: text.y + dy / d * k })
  return { text, from: along(13), to: along(d - 4) }
}

// Arrow along the front of a ring just outside the turning face, pointing the way it turns.
// The ring sits on the face, centered on it (`lift` raises it off the face).
export function getMoveArrow(move, view = DEFAULT_CUBE_VIEW, dims = 2, lift = 0.02) {
  const axis = faceAxis(move.face)
  const { half } = model(dims)
  const slice = move.face in SLICES
  // face moves: a ring just outside the face; middle layers: a ring around the middle of the puzzle
  const center = slice ? [0, 0, 0] : scale(axis, half[axisIndex(axis)] + lift)
  const helper = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
  const e1 = unit(cross(helper, axis))
  const e2 = cross(axis, e1)
  // on a face the ring fills three quarters of it each way, so it stays an oval on a long face;
  // around a middle layer it is a circle clear of the puzzle
  const reachAlong = (e) => e.reduce((a, c, k) => a + Math.abs(c) * half[k], 0)
  const ringR = slice ? Math.hypot(...half.filter((_, k) => k !== axisIndex(axis))) + 0.2 : 0
  const r1 = slice ? ringR : 0.75 * reachAlong(e1), r2 = slice ? ringR : 0.75 * reachAlong(e2)
  const at = (t) => toView(add(center, add(scale(e1, r1 * Math.cos(t)), scale(e2, r2 * Math.sin(t)))), view)
  let front = 0, maxZ = -Infinity
  for (let deg = 0; deg < 360; deg += 2) {
    const z = at(deg * Math.PI / 180)[2]
    if (z > maxZ) { maxZ = z; front = deg }
  }
  const dir = Math.sign(moveAngle(move))
  const sweep = Math.abs(move.turns) === 2 ? 150 : 115
  const pts = []
  for (let k = -sweep; k <= sweep; k += 5) pts.push(to2d(at((front + dir * k) * Math.PI / 180)))
  return arrowPaths(pts)
}

// Where to write a move's letter: beside the puzzle, out past the turning face (and past its turn
// arrow), so it sits next to the side that moves. Middle layers use the face they turn like.
export function getMoveLabelPoint(move, view = DEFAULT_CUBE_VIEW, dims = 2, gap = 20) {
  const corners = boxCorners(dims).map(p => to2d(toView(p, view)))
  return labelBeyond(to2d(toView(faceAxis(move.face), view)), [...corners, ...getMoveArrow(move, view, dims).points], gap)
}
