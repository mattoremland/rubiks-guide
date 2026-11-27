import { useState } from 'react'
import CubeDiagram from '../diagrams/CubeDiagram'
import MoveSequence from '../notation/MoveSequence'
import { withEmphasis } from '../../lib/emphasis'
import { MoveLettersContext } from '../diagrams/movePlayer'

// One card per move: its animation, the move written out, and what it does.
function MoveGrid({ puzzleType, state, view, moves }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {moves.map((m) => (
        <figure key={m.notation} className="flex flex-col items-center gap-2 bg-surface border border-border rounded-lg p-3">
          <CubeDiagram
            puzzleType={puzzleType}
            state={state}
            view={m.view ?? view}
            animation={m.animation}
            labels={m.labels}
            size={140}
          />
          <MoveSequence notation={m.notation} />
          <figcaption className="text-xs text-text-secondary text-center">{m.label}</figcaption>
        </figure>
      ))}
    </div>
  )
}

// Notation section: defines the pieces with labeled figures, then animates each move.
// `sections` ([{ text, moves }]) add further groups of moves, each with its own explanation.
// With `collapsible`, the section starts closed every visit and the heading opens and closes it.
export default function PuzzleNotation({ puzzleType, notation: n, collapsible = false }) {
  const [open, setOpen] = useState(!collapsible)
  const toggle = () => setOpen(!open)
  return (
    <section className="mb-10">
      {collapsible ? (
        <h2 className="mb-4">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            className="flex items-center gap-2 text-xl font-semibold text-text-primary hover:text-accent"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" className={`w-4 h-4 fill-current transition-transform ${open ? 'rotate-90' : ''}`}>
              <path d="M7 4l7 6-7 6z" />
            </svg>
            Notation
            <span className="text-sm font-normal text-text-muted">{open ? '(click to hide)' : '(click to show)'}</span>
          </button>
        </h2>
      ) : (
        <h2 className="text-xl font-semibold text-text-primary mb-4">Notation</h2>
      )}
      {open && (
      <div className="bg-surface-raised border border-border rounded-lg p-5 space-y-6">
        <p className="text-text-secondary text-sm">{withEmphasis(n.intro)}</p>
        <div className="flex flex-wrap justify-center gap-8">
          {n.figures.map((fig) => (
            <figure key={fig.caption} className="flex flex-col items-center gap-2">
              <CubeDiagram
                puzzleType={puzzleType}
                state={fig.state}
                view={fig.view}
                outline={fig.outline}
                labels={fig.labels}
                size={180}
              />
              <figcaption className="text-sm text-text-secondary text-center max-w-md">{fig.caption}</figcaption>
            </figure>
          ))}
        </div>
        <p className="text-text-secondary text-sm">{n.directions}</p>
        {/* each card already names its move under the picture */}
        <MoveLettersContext.Provider value={false}>
        <MoveGrid puzzleType={puzzleType} state={n.state} view={n.view} moves={n.moves} />
        {n.sections?.map((sec) => (
          <div key={sec.text} className="space-y-4">
            <p className="text-text-secondary text-sm">{withEmphasis(sec.text)}</p>
            <MoveGrid puzzleType={puzzleType} state={n.state} view={n.view} moves={sec.moves} />
          </div>
        ))}
        </MoveLettersContext.Provider>
      </div>
      )}
    </section>
  )
}
