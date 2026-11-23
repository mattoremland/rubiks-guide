// 3D model, move simulator and projection for NxNxN cubes.
// Model axes: x right, y up, z toward the viewer (front). The camera looks along -z with x to the
// right, so the drawing is not mirrored: a clockwise move looks clockwise on screen.

const FACES = {
  // normal, top-left corner of the face as you look at it, then "right" and "down" along the face
  U: { n: [0, 1, 0], o: [-1, 1, -1], right: [1, 0, 0], down: [0, 0, 1] },
  D: { n: [0, -1, 0], o: [-1, -1, 1], right: [1, 0, 0], down: [0, 0, -1] },
  F: { n: [0, 0, 1], o: [-1, 1, 1], right: [1, 0, 0], down: [0, -1, 0] },
  B: { n: [0, 0, -1], o: [1, 1, -1], right: [-1, 0, 0], down: [0, -1, 0] },
  R: { n: [1, 0, 0], o: [1, 1, 1], right: [0, 0, -1], down: [0, -1, 0] },
  L: { n: [-1, 0, 0], o: [-1, 1, -1], right: [0, 0, 1], down: [0, -1, 0] },
}
const ROTATION_AXIS = { x: 'R', y: 'U', z: 'F' }

export const DEFAULT_CUBE_VIEW = { x: 25, y: 35 }
export const SOLVED_COLORS = { U: 'W', D: 'Y', F: 'G', B: 'B', R: 'R', L: 'O' }
const SIZE_PX = 100

const add = (a, b) => a.map((x, i) => x + b[i])
const sub = (a, b) => a.map((x, i) => x - b[i])
const scale = (a, s) => a.map(x => x * s)
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const unit = (a) => scale(a, 1 / Math.hypot(...a))

function rotateAbout(p, axis, angle) {
  const c = Math.cos(angle), s = Math.sin(angle)
  return add(add(scale(p, c), scale(cross(axis, p), s)), scale(axis, dot(axis, p) * (1 - c)))
}

// view.x tilts the top toward the camera; view.y turns the right face toward the camera (degrees).
function toView(p, view) {
  const b = -view.y * Math.PI / 180, a = view.x * Math.PI / 180
  const q = [p[0] * Math.cos(b) + p[2] * Math.sin(b), p[1], -p[0] * Math.sin(b) + p[2] * Math.cos(b)]
  return [q[0], q[1] * Math.cos(a) - q[2] * Math.sin(a), q[1] * Math.sin(a) + q[2] * Math.cos(a)]
}

function shadeFor(viewNormal) {
  const l = unit([0.35, 0.8, 0.5])
  return 0.68 + 0.32 * Math.max(0, dot(unit(viewNormal), l))
}

const models = {}

// Stickers in model units: the cube spans -1..1 on every axis.
function model(n) {
  if (models[n]) return models[n]
  const step = 2 / n
  const stickers = []
  for (const [face, f] of Object.entries(FACES)) {
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const at = (dr, dc) => add(f.o, add(scale(f.right, (c + dc) * step), scale(f.down, (r + dr) * step)))
        const pts = [at(0, 0), at(0, 1), at(1, 1), at(1, 0)]
        stickers.push({ face, index: r * n + c, pts, centroid: scale(pts.reduce(add), 1 / 4) })
      }
    }
  }
  models[n] = { n, step, stickers }
  return models[n]
}

export function solvedState(n) {
  return Object.fromEntries(Object.entries(SOLVED_COLORS).map(([f, c]) => [f, Array(n * n).fill(c)]))
}

// "R U R' U2 x" -> [{ face: 'R', turns: 1 }, ...]; turns: 1 clockwise, -1 counterclockwise, 2 half turn.
export function parseAlg(alg) {
  return [...alg.matchAll(/([RLUDFBxyz])(2'|2|')?/g)].map(([, face, mod]) => ({
    face,
    turns: mod === "'" ? -1 : mod?.startsWith('2') ? 2 : 1,
  }))
}

export const moveName = (m) => m.face + (m.turns === -1 ? "'" : m.turns === 2 ? '2' : '')

// Clockwise, seen from outside the face, is a negative rotation about its outward normal.
export const moveAngle = (m) => -m.turns * Math.PI / 2

function layerOf(n, move) {
  const { step } = model(n)
  const faceKey = ROTATION_AXIS[move.face] ?? move.face
  const axis = FACES[faceKey].n
  const whole = move.face in ROTATION_AXIS
  const cutAt = 1 - step
  return { axis, whole, cutAt, inLayer: (s) => whole || dot(s.centroid, axis) > cutAt + 1e-9 }
}

export function applyMove(state, move) {
  const n = Math.round(Math.sqrt(state.U.length))
  const { stickers } = model(n)
  const { axis, inLayer } = layerOf(n, move)
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

export const applyAlg = (state, alg) => parseAlg(alg).reduce(applyMove, state)

const to2d = (p) => ({ x: p[0] * SIZE_PX / 2, y: -p[1] * SIZE_PX / 2 })

// The square where a turning layer separates from the rest of the cube.
function cutSquare(axis, at) {
  const i = axis.findIndex(v => v !== 0)
  const [a, b] = [0, 1, 2].filter(k => k !== i)
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => {
    const p = [0, 0, 0]
    p[i] = axis[i] * at
    p[a] = u
    p[b] = v
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

// Polygons, back to front, for the cube with one move part-way through (`angle` radians).
// `color` is a sticker code, or null for the exposed inside of the cube.
export function getTurnPolygons(state, move, angle, view = DEFAULT_CUBE_VIEW) {
  const n = Math.round(Math.sqrt(state.U.length))
  const { stickers } = model(n)
  const { axis, whole, cutAt, inLayer } = move ? layerOf(n, move) : { whole: true, inLayer: () => true }
  const body = []
  const layer = []
  if (move && !whole) {
    body.push({ pts: cutSquare(axis, cutAt), normal: axis, color: null })
    layer.push({ pts: cutSquare(axis, cutAt).map(p => rotateAbout(p, axis, angle)), normal: scale(axis, -1), color: null })
  }
  for (const s of stickers) {
    const base = { face: s.face, index: s.index, color: state[s.face][s.index] }
    const fn = FACES[s.face].n
    if (move && inLayer(s)) layer.push({ ...base, pts: s.pts.map(p => rotateAbout(p, axis, angle)), normal: rotateAbout(fn, axis, angle) })
    else body.push({ ...base, pts: s.pts, normal: fn })
  }
  const layerInFront = !move || whole || toView(axis, view)[2] > 0
  const [first, second] = layerInFront ? [body, layer] : [layer, body]
  return [...visiblePolys(first, view), ...visiblePolys(second, view)]
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

const CUBE_CORNERS = [-1, 1].flatMap(x => [-1, 1].flatMap(y => [-1, 1].map(z => [x, y, z])))

// The 12 edges of the box a move turns, each marked visible if it borders a face of the cube
// that faces the camera. (The layer's inner face is inside the cube, so it never counts.)
export function getMoveOutlineEdges(n, move, view = DEFAULT_CUBE_VIEW) {
  const { axis, whole, cutAt } = layerOf(n, move)
  const lo = [-1, -1, -1], hi = [1, 1, 1]
  const inner = []
  if (!whole) {
    const i = axis.findIndex(v => v !== 0)
    if (axis[i] > 0) lo[i] = cutAt
    else hi[i] = -cutAt
    inner.push(axis.map(v => -v).join())
  }
  const faceSeen = (normal) => !inner.includes(normal.join()) && toView(normal, view)[2] > 1e-9
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

// Outline around a group of stickers on one face.
export function getStickerGroupOutline(n, face, indices, view = DEFAULT_CUBE_VIEW) {
  const pts = model(n).stickers.filter(s => s.face === face && indices.includes(s.index)).flatMap(s => s.pts)
  return hull(pts.map(p => to2d(toView(p, view))))
}

export function getViewBounds(view = DEFAULT_CUBE_VIEW) {
  const pts = CUBE_CORNERS.map(p => to2d(toView(p, view)))
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y)
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) }
}

// Whether a face can be seen from this view.
export const isFaceVisible = (face, view = DEFAULT_CUBE_VIEW) => toView(FACES[face].n, view)[2] > 1e-9

// The center of a face, for a label.
export function getFaceLabelPoint(face, view = DEFAULT_CUBE_VIEW) {
  return to2d(toView(FACES[face].n, view))
}

// Label for a face hidden from this view: text beside the cube, level with the edge nearest that
// face, and an arrow from the text to that edge. `side` ('left' / 'right') overrides which side.
export function getHiddenFaceLabel(face, view = DEFAULT_CUBE_VIEW, side) {
  const c = to2d(toView(FACES[face].n, view))
  const len = Math.hypot(c.x, c.y) || 1
  const out = { x: c.x / len, y: c.y / len }
  const corners = CUBE_CORNERS.map(p => to2d(toView(p, view)))
  // the two outline corners furthest toward the hidden face; aim at the middle of the edge between them
  const [a, b] = [...corners].sort((p, q) => (q.x * out.x + q.y * out.y) - (p.x * out.x + p.y * out.y))
  const target = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  // put the text beside the cube, level with that edge, so it stays clear of a turn arrow
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
export function getMoveArrow(move, view = DEFAULT_CUBE_VIEW) {
  const faceKey = ROTATION_AXIS[move.face] ?? move.face
  const axis = FACES[faceKey].n
  const center = scale(axis, 1.5)
  const helper = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
  const e1 = unit(cross(helper, axis))
  const e2 = cross(axis, e1)
  const rho = 0.75
  const at = (t) => toView(add(center, add(scale(e1, rho * Math.cos(t)), scale(e2, rho * Math.sin(t)))), view)
  let front = 0, maxZ = -Infinity
  for (let deg = 0; deg < 360; deg += 2) {
    const z = at(deg * Math.PI / 180)[2]
    if (z > maxZ) { maxZ = z; front = deg }
  }
  const dir = Math.sign(moveAngle(move))
  const sweep = move.turns === 2 ? 150 : 115
  const pts = []
  for (let k = -sweep; k <= sweep; k += 5) pts.push(to2d(at((front + dir * k) * Math.PI / 180)))
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y)
  return {
    end: pts[pts.length - 1],
    d: 'M ' + pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L '),
    bounds: { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) },
  }
}
