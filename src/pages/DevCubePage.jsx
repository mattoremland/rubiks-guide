import { useCallback, useMemo, useRef, useState } from 'react'
import IsoCube3D from '../components/diagrams/IsoCube3D'
import { solvedState, applyAlg, isFaceVisible, DEFAULT_CUBE_VIEW } from '../lib/cube3d'

const SCRAMBLE = "R U2 F' R2 U' F U R' F2 U2 R F'"

// Drag (or type) to choose a camera angle for cube diagrams.
export default function DevCubePage() {
  const [view, setView] = useState(DEFAULT_CUBE_VIEW)
  const [shape, setShape] = useState('2x2x2')
  const dragging = useRef(null)
  const state = useMemo(() => {
    const [x, y, z] = shape.split('x').map(Number)
    return applyAlg(solvedState({ x, y, z }), SCRAMBLE)
  }, [shape])

  const onPointerDown = useCallback((e) => {
    dragging.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])
  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return
    const dx = e.clientX - dragging.current.x
    const dy = e.clientY - dragging.current.y
    dragging.current = { x: e.clientX, y: e.clientY }
    setView(v => ({ x: Math.round(v.x + dy * 0.5), y: Math.round(v.y - dx * 0.5) }))
  }, [])
  const onPointerUp = useCallback(() => { dragging.current = null }, [])

  const visible = ['U', 'D', 'F', 'B', 'R', 'L'].filter(f => isFaceVisible(f, view))
  const field = (key) => (
    <label className="flex items-center gap-1">
      {key.toUpperCase()}:
      <input
        type="number"
        value={view[key]}
        onChange={(e) => setView(v => ({ ...v, [key]: parseFloat(e.target.value || 0) }))}
        className="w-20 px-2 py-1 bg-surface border border-border rounded text-text-primary"
        step="1"
      />
      &deg;
    </label>
  )

  return (
    <div className="min-h-screen bg-surface text-text-primary p-8">
      <h1 className="text-2xl font-bold mb-2">Cube Angle Tool</h1>
      <p className="text-text-secondary mb-6">Drag the cube or type angles. Send me the X and Y you like.</p>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div
          className="bg-surface-raised border border-border rounded-xl p-4 cursor-grab active:cursor-grabbing select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ touchAction: 'none' }}
        >
          <IsoCube3D state={state} view={view} size={360} labels={{ U: 'U', D: 'D', F: 'F', B: 'B', R: 'R', L: 'L' }} />
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-4 font-mono text-text-secondary">{field('x')}{field('y')}</div>
          <div className="flex items-center gap-2 text-text-secondary">
            Puzzle:
            {/* width x height x depth */}
            {['2x2x2', '3x2x3', '3x3x3', '4x4x4', '5x5x5'].map(k => (
              <button
                key={k}
                type="button"
                onClick={() => setShape(k)}
                className={`px-2 py-1 rounded border border-border ${k === shape ? 'bg-accent text-white' : 'hover:bg-surface-hover'}`}
              >
                {k === '3x2x3' ? '3x3x2' : k}
              </button>
            ))}
          </div>
          <p className="text-text-secondary">Visible faces: <span className="font-mono text-text-primary">{visible.join(', ')}</span></p>
          <pre className="font-mono bg-surface-raised border border-border rounded p-3">{`view: { x: ${view.x}, y: ${view.y} }`}</pre>
          <button type="button" onClick={() => setView(DEFAULT_CUBE_VIEW)} className="px-3 py-1 rounded border border-border hover:bg-surface-hover">
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
