import { useState, useRef, useCallback } from 'react'
import { getStickerColor, shadedColor } from '../data/colors'
import { createPyraminxSolvedState } from '../lib/cubeState'

const EDGE = 150

// Regular tetrahedron vertices (edge length EDGE, centered at origin)
// D face on the bottom (xz plane), apex above
const h = EDGE * Math.sqrt(2 / 3) // height of tetrahedron
const r = EDGE / Math.sqrt(3)     // circumradius of base triangle

const BASE_VERTS_3D = {
  apex: [0, h * 0.75, 0],                                           // top
  fl:   [-EDGE / 2, -h * 0.25, -r * 0.5],                          // front-left base
  fr:   [EDGE / 2, -h * 0.25, -r * 0.5],                           // front-right base
  back: [0, -h * 0.25, r],                                          // back base
}

// Face definitions: [tip vertex, base-left, base-right]
// Order matters for sticker subdivision (tip = index 0)
const FACE_KEYS = {
  F: ['apex', 'fl', 'fr'],
  L: ['fl', 'back', 'apex'],
  R: ['fr', 'apex', 'back'],
  D: ['fl', 'fr', 'back'],
}

function rotateY(v, angle) {
  const c = Math.cos(angle), s = Math.sin(angle)
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]
}

function rotateX(v, angle) {
  const c = Math.cos(angle), s = Math.sin(angle)
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]
}

function project(v) {
  return { x: v[0], y: -v[1], z: v[2] }
}

function getTransformedVerts(rotX, rotY) {
  const result = {}
  for (const [key, v] of Object.entries(BASE_VERTS_3D)) {
    let p = rotateY(v, rotY)
    p = rotateX(p, rotX)
    result[key] = p
  }
  return result
}

function faceNormalZ(v0, v1, v2) {
  const ax = v1[0] - v0[0], ay = v1[1] - v0[1], az = v1[2] - v0[2]
  const bx = v2[0] - v0[0], by = v2[1] - v0[1], bz = v2[2] - v0[2]
  return ax * by - ay * bx // z-component of cross product (after projection, this tells us if face is front-facing)
}

function faceLighting(v0, v1, v2) {
  const ax = v1[0] - v0[0], ay = v1[1] - v0[1], az = v1[2] - v0[2]
  const bx = v2[0] - v0[0], by = v2[1] - v0[1], bz = v2[2] - v0[2]
  const nx = ay * bz - az * by
  const ny = az * bx - ax * bz
  const nz = ax * by - ay * bx
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
  // Light from upper-right-front
  const lx = 0.3, ly = 0.8, lz = -0.5
  const ll = Math.sqrt(lx * lx + ly * ly + lz * lz)
  const dot = (nx * lx + ny * ly + nz * lz) / (len * ll)
  return 0.45 + 0.55 * Math.max(0, dot)
}

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

function getFaceStickers(tip2d, baseL2d, baseR2d) {
  const stickers = []
  let index = 0
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col <= row; col++) {
      stickers.push({
        index,
        points: [
          gridPoint(tip2d, baseL2d, baseR2d, row, col),
          gridPoint(tip2d, baseL2d, baseR2d, row + 1, col),
          gridPoint(tip2d, baseL2d, baseR2d, row + 1, col + 1),
        ],
      })
      index++
      if (col < row) {
        stickers.push({
          index,
          points: [
            gridPoint(tip2d, baseL2d, baseR2d, row, col),
            gridPoint(tip2d, baseL2d, baseR2d, row, col + 1),
            gridPoint(tip2d, baseL2d, baseR2d, row + 1, col + 1),
          ],
        })
        index++
      }
    }
  }
  return stickers
}

const SOLVED = createPyraminxSolvedState()
const FACE_COLORS = { F: 'G', L: 'B', R: 'R', D: 'Y' }

export default function DevRotatePage() {
  const [rotX, setRotX] = useState(-16 * Math.PI / 180)
  const [rotY, setRotY] = useState(72 * Math.PI / 180)
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const onPointerDown = useCallback((e) => {
    dragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setRotY(prev => prev + dx * 0.01)
    setRotX(prev => prev + dy * 0.01)
  }, [])

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  const verts3d = getTransformedVerts(rotX, rotY)

  // Project to 2D
  const verts2d = {}
  for (const [key, v] of Object.entries(verts3d)) {
    verts2d[key] = project(v)
  }

  // Compute tetrahedron centroid for outward-normal detection
  const allKeys = ['apex', 'fl', 'fr', 'back']
  const center3d = [0, 0, 0]
  for (const k of allKeys) {
    center3d[0] += verts3d[k][0] / 4
    center3d[1] += verts3d[k][1] / 4
    center3d[2] += verts3d[k][2] / 4
  }

  const visibleFaces = []
  for (const [face, [tipKey, blKey, brKey]] of Object.entries(FACE_KEYS)) {
    const v0 = verts3d[tipKey]
    const v1 = verts3d[blKey]
    const v2 = verts3d[brKey]
    // Cross product for face normal
    const ax = v1[0] - v0[0], ay = v1[1] - v0[1], az = v1[2] - v0[2]
    const bx = v2[0] - v0[0], by = v2[1] - v0[1], bz = v2[2] - v0[2]
    let nx = ay * bz - az * by
    let ny = az * bx - ax * bz
    let nz = ax * by - ay * bx
    // Face centroid
    const fc = [(v0[0] + v1[0] + v2[0]) / 3, (v0[1] + v1[1] + v2[1]) / 3, (v0[2] + v1[2] + v2[2]) / 3]
    // Ensure normal points outward (away from tetrahedron center)
    const toFace = [fc[0] - center3d[0], fc[1] - center3d[1], fc[2] - center3d[2]]
    if (nx * toFace[0] + ny * toFace[1] + nz * toFace[2] < 0) {
      nx = -nx; ny = -ny; nz = -nz
    }
    // Face is visible if outward normal points toward camera (camera at z = -infinity, looking +z)
    // So visible when nz < 0
    if (nz < 0) {
      // Lighting using the corrected outward normal
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
      const lx = 0.3, ly = 0.8, lz = -0.5
      const ll = Math.sqrt(lx * lx + ly * ly + lz * lz)
      const dot = (nx * lx + ny * ly + nz * lz) / (len * ll)
      const shade = 0.45 + 0.55 * Math.max(0, dot)
      const avgZ = (v0[2] + v1[2] + v2[2]) / 3
      visibleFaces.push({ face, tipKey, blKey, brKey, shade, avgZ })
    }
  }

  // Sort by avgZ descending (draw far faces first)
  visibleFaces.sort((a, b) => b.avgZ - a.avgZ)

  // Compute projected VERTS for export (the values to put in pyraminxGeometry.js)
  const exportVerts = {
    top: verts2d.apex,
    fl: verts2d.fl,
    fr: verts2d.fr,
    back: verts2d.back,
  }

  // Determine visible face list and shading for export
  const exportFaces = visibleFaces.map(f => ({
    name: f.face,
    shade: Math.round(f.shade * 100) / 100,
  }))

  const degX = ((rotX * 180 / Math.PI) % 360).toFixed(1)
  const degY = ((rotY * 180 / Math.PI) % 360).toFixed(1)

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-8">
      <h1 className="text-2xl font-bold mb-2">Pyraminx 3D Rotation Tool</h1>
      <p className="text-text-secondary mb-6">Click and drag to rotate. Copy the values below when you find the angle you want.</p>

      <div className="flex flex-col gap-8">
        <div
          className="bg-surface-raised border border-border rounded-xl p-4 cursor-grab active:cursor-grabbing select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ touchAction: 'none' }}
        >
          <svg viewBox="-200 -200 400 400" className="block mx-auto" style={{ width: '100%', maxWidth: 400, aspectRatio: '1' }}>
            <rect x={-200} y={-200} width={400} height={400} fill="transparent" />
            {visibleFaces.map(({ face, tipKey, blKey, brKey, shade }) => {
              const tip2d = verts2d[tipKey]
              const bl2d = verts2d[blKey]
              const br2d = verts2d[brKey]
              const stickers = getFaceStickers(tip2d, bl2d, br2d)
              const faceColor = FACE_COLORS[face]

              return (
                <g key={face}>
                  {stickers.map((s) => {
                    const baseHex = getStickerColor(faceColor)
                    const fill = shadedColor(baseHex, shade)
                    const pts = s.points.map(p => `${p.x},${p.y}`).join(' ')
                    return (
                      <polygon
                        key={`${face}-${s.index}`}
                        points={pts}
                        fill={fill}
                        stroke="#1a1a2e"
                        strokeWidth={1}
                      />
                    )
                  })}
                </g>
              )
            })}
          </svg>
        </div>

        <div className="flex-1 space-y-4">
          <div className="bg-surface-raised border border-border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Rotation</h2>
            <div className="flex items-center gap-4 text-sm font-mono text-text-secondary">
              <label className="flex items-center gap-1">
                X:
                <input
                  type="number"
                  value={degX}
                  onChange={(e) => setRotX(parseFloat(e.target.value || 0) * Math.PI / 180)}
                  className="w-20 px-2 py-1 bg-bg-primary border border-border rounded text-text-primary"
                  step="1"
                />
                &deg;
              </label>
              <label className="flex items-center gap-1">
                Y:
                <input
                  type="number"
                  value={degY}
                  onChange={(e) => setRotY(parseFloat(e.target.value || 0) * Math.PI / 180)}
                  className="w-20 px-2 py-1 bg-bg-primary border border-border rounded text-text-primary"
                  step="1"
                />
                &deg;
              </label>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => { setRotX(0); setRotY(0) }}
                className="px-3 py-1 text-sm bg-accent text-white rounded hover:opacity-80"
              >
                Reset
              </button>
              <button
                onClick={() => { setRotX(-1.0); setRotY(0.3) }}
                className="px-3 py-1 text-sm bg-surface-raised border border-border rounded hover:bg-bg-secondary"
              >
                3-face view
              </button>
              <button
                onClick={() => { setRotX(-Math.PI / 2); setRotY(0) }}
                className="px-3 py-1 text-sm bg-surface-raised border border-border rounded hover:bg-bg-secondary"
              >
                Top-down
              </button>
              <button
                onClick={() => { setRotX(-1.2); setRotY(0.5) }}
                className="px-3 py-1 text-sm bg-surface-raised border border-border rounded hover:bg-bg-secondary"
              >
                Angled
              </button>
            </div>
          </div>

          <div className="bg-surface-raised border border-border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Visible Faces ({exportFaces.length})</h2>
            <div className="text-sm font-mono space-y-1">
              {exportFaces.map(f => (
                <div key={f.name}>
                  <span className="text-accent">{f.name}</span>: shade = {f.shade}
                </div>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-2">Draw order (back to front): {exportFaces.map(f => f.name).join(', ')}</p>
          </div>

          <div className="bg-surface-raised border border-border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Exported Vertices</h2>
            <pre className="text-sm font-mono text-text-secondary bg-bg-primary rounded p-3 overflow-x-auto">{`const VERTS = {
  top:  { x: ${Math.round(exportVerts.top.x)}, y: ${Math.round(exportVerts.top.y)} },
  fl:   { x: ${Math.round(exportVerts.fl.x)}, y: ${Math.round(exportVerts.fl.y)} },
  fr:   { x: ${Math.round(exportVerts.fr.x)}, y: ${Math.round(exportVerts.fr.y)} },
  back: { x: ${Math.round(exportVerts.back.x)}, y: ${Math.round(exportVerts.back.y)} },
}

const FACE_DEFS = {
${exportFaces.map(f => {
  const faceKeys = FACE_KEYS[f.name]
  const vertMap = { apex: 'VERTS.top', fl: 'VERTS.fl', fr: 'VERTS.fr', back: 'VERTS.back' }
  const vertsStr = faceKeys.map(k => vertMap[k]).join(', ')
  return `  ${f.name}: { verts: [${vertsStr}], shade: ${f.shade} },`
}).join('\n')}
}

const DRAW_ORDER = [${exportFaces.map(f => `'${f.name}'`).join(', ')}]`}</pre>
          </div>

          <div className="bg-surface-raised border border-border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">ViewBox Suggestion</h2>
            <pre className="text-sm font-mono text-text-secondary bg-bg-primary rounded p-3">{(() => {
              const allPts = Object.values(exportVerts)
              const minX = Math.min(...allPts.map(p => p.x))
              const maxX = Math.max(...allPts.map(p => p.x))
              const minY = Math.min(...allPts.map(p => p.y))
              const maxY = Math.max(...allPts.map(p => p.y))
              const pad = 25
              const vbX = Math.round(minX - pad)
              const vbY = Math.round(minY - pad)
              const vbW = Math.round(maxX - minX + pad * 2)
              const vbH = Math.round(maxY - minY + pad * 2)
              return `viewBox="${vbX} ${vbY} ${vbW} ${vbH}"`
            })()}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
