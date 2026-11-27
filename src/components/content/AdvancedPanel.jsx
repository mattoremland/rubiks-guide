import { useState } from 'react'
import CubeDiagram from '../diagrams/CubeDiagram'
import TopPattern from '../diagrams/TopPattern'
import MoveSequence from '../notation/MoveSequence'
import { withEmphasis } from '../../lib/emphasis'

// Optional extra algorithms inside a step, closed by default so the main explanation stays simple.
// `advanced`: { title, intro, patternColor, cases: [{ name, moves, pattern, state }] }; each case
// shows its top pattern, its algorithm, and a cube in that case playing the algorithm.
export default function AdvancedPanel({ advanced, puzzleType, dimensions, id }) {
  const [open, setOpen] = useState(false)
  return (
    <div id={id} className="scroll-mt-24 mb-6 border border-border rounded-lg bg-surface">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-text-primary hover:text-accent"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" className={`w-4 h-4 fill-current transition-transform ${open ? 'rotate-90' : ''}`}>
          <path d="M7 4l7 6-7 6z" />
        </svg>
        {advanced.title}
        <span className="font-normal text-text-muted">{open ? '(click to hide)' : '(click to show)'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4">
          {advanced.intro && <p className="text-sm text-text-secondary">{withEmphasis(advanced.intro)}</p>}
          <ul className="divide-y divide-border">
            {advanced.cases.map((c) => (
              <li key={c.name} className="py-3 grid gap-4 grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] items-center">
                <TopPattern pattern={c.pattern} color={advanced.patternColor} size={80} />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-text-primary">{c.name}</p>
                  <div className="flex flex-wrap gap-1"><MoveSequence notation={c.moves} /></div>
                </div>
                <div className="col-span-2 sm:col-span-1 flex justify-center">
                  <CubeDiagram
                    puzzleType={puzzleType}
                    dimensions={dimensions}
                    state={c.state}
                    animation={{ alg: c.moves, outlineMoves: true, highlightAfter: [{ face: 'U', indices: [0, 1, 2, 3, 4, 5, 6, 7, 8] }] }}
                    size={140}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
