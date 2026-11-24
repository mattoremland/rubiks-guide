import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import IsoCube3D from '../components/diagrams/IsoCube3D'
import { solvedState, applyAlg, isFaceVisible, DEFAULT_CUBE_VIEW } from '../lib/cube3d'

const SCRAMBLE = "R U2 F' R2 U' F U R' F2 U2 R F'"

// A degree box you can type freely in (a minus sign, an empty box) while it updates the view
// whenever the text is a number.
function AngleInput({ label, value, onChange }) {
  const [text, setText] = useState(String(value))
  useEffect(() => {
    // follow changes made elsewhere (dragging, Reset) unless the text already means this value
    if (parseFloat(text) !== value) setText(String(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return (
    <label className="flex items-center gap-1">
      {label}:
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => {
          const t = e.target.value
          if (!/^-?\d*\.?\d*$/.test(t)) return
          setText(t)
          const n = parseFloat(t)
          if (Number.isFinite(n)) onChange(n)
        }}
        onBlur={() => setText(String(value))}
        className="w-20 px-2 py-1 bg-surface border border-border rounded text-text-primary"
      />
      &deg;
    </label>
  )
}

// Drag (or type) to choose a camera angle for cube diagrams.
export default function DevCubePage() {
  const [view, setView] = useState({ z: 0, ...DEFAULT_CUBE_VIEW })
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
    setView(v => ({ ...v, x: Math.round(v.x + dy * 0.5), y: Math.round(v.y - dx * 0.5) }))
  }, [])
  const onPointerUp = useCallback(() => { dragging.current = null }, [])

  const visible = ['U', 'D', 'F', 'B', 'R', 'L'].filter(f => isFaceVisible(f, view))
  const field = (key) => (
    <AngleInput label={key.toUpperCase()} value={view[key]} onChange={(n) => setView(v => ({ ...v, [key]: n }))} />
  )

  return (
    <div className="min-h-screen bg-surface text-text-primary p-8">
      <h1 className="text-2xl font-bold mb-2">Cube Angle Tool</h1>
      <p className="text-text-secondary mb-6">Drag the cube or type angles (Z rolls the picture). Send me the X, Y and Z you like.</p>
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
          <div className="flex items-center gap-4 font-mono text-text-secondary">{field('x')}{field('y')}{field('z')}</div>
          <div className="flex items-center gap-2 text-text-secondary">
            Puzzle:
            {/* width x height x depth */}
            {['2x2x2', '2x3x2', '3x2x3', '3x3x3', '4x4x4', '5x5x5'].map(k => (
              <button
                key={k}
                type="button"
                onClick={() => setShape(k)}
                className={`px-2 py-1 rounded border border-border ${k === shape ? 'bg-accent text-white' : 'hover:bg-surface-hover'}`}
              >
                {{ '3x2x3': '3x3x2', '2x3x2': '2x2x3' }[k] ?? k}
              </button>
            ))}
          </div>
          <p className="text-text-secondary">Visible faces: <span className="font-mono text-text-primary">{visible.join(', ')}</span></p>
          <pre className="font-mono bg-surface-raised border border-border rounded p-3">{`view: { x: ${view.x}, y: ${view.y}, z: ${view.z} }`}</pre>
          <button type="button" onClick={() => setView({ z: 0, ...DEFAULT_CUBE_VIEW })} className="px-3 py-1 rounded border border-border hover:bg-surface-hover">
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
