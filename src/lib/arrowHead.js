// Turn arrows drawn as one shape: an arc (`pts`, 2D points from tail to tip) that runs into a
// drawn arrowhead. The head points along the arc's last stretch (not just its last tiny segment)
// and has a swept-back notch; the arc stops inside the notch.
const HEAD_LEN = 10, HEAD_HALF = 6, NOTCH = 0.65

const path = (list) => 'M ' + list.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')

export function arrowPaths(pts) {
  const tip = pts[pts.length - 1]
  const dist = (p) => Math.hypot(p.x - tip.x, p.y - tip.y)
  const back = [...pts].reverse().find(p => dist(p) >= HEAD_LEN) ?? pts[0]
  const t = { x: (tip.x - back.x) / dist(back), y: (tip.y - back.y) / dist(back) }
  const n = { x: -t.y, y: t.x }
  const along = (k, w = 0) => ({ x: tip.x - t.x * k + n.x * w, y: tip.y - t.y * k + n.y * w })
  const notch = along(HEAD_LEN * NOTCH)
  const shaft = [...pts.filter(p => dist(p) > HEAD_LEN * NOTCH), notch]
  const head = [tip, along(HEAD_LEN, HEAD_HALF), notch, along(HEAD_LEN, -HEAD_HALF)]
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y)
  return {
    end: tip,
    points: pts,
    d: path(pts),
    shaft: path(shaft),
    head: path(head) + ' Z',
    bounds: { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) },
  }
}

// Where to write a move's letter: straight out from the puzzle's center in direction `out`
// (a 2D vector), past every point in `pts` (the puzzle's outline and the turn arrow) by `gap`.
export function labelBeyond(out, pts, gap = 20) {
  let len = Math.hypot(out.x, out.y)
  if (len < 1e-6) { out = { x: 0, y: 1 }; len = 1 }
  const u = { x: out.x / len, y: out.y / len }
  const r = Math.max(...pts.map(p => p.x * u.x + p.y * u.y)) + gap
  return { x: u.x * r, y: u.y * r }
}
