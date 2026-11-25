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
          <MoveSequence notation={m.notation} neutral />
          <figcaption className="text-xs text-text-secondary text-center">{m.label}</figcaption>
        </figure>
      ))}
    </div>
  )
}

// Notation section: defines the pieces with labeled figures, then animates each move.
// `sections` ([{ text, moves }]) add further groups of moves, each with its own explanation.
export default function PuzzleNotation({ puzzleType, notation: n }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Notation</h2>
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
    </section>
  )
}
