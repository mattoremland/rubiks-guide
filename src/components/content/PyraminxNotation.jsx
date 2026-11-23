import CubeDiagram from '../diagrams/CubeDiagram'
import MoveSequence from '../notation/MoveSequence'
import { pyraminxNotation as n } from '../../data/methods/pyraminx'
import { withEmphasis } from '../../lib/emphasis'

export default function PyraminxNotation() {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Notation</h2>
      <div className="bg-surface-raised border border-border rounded-lg p-5 space-y-6">
        <p className="text-text-secondary text-sm">{withEmphasis(n.intro)}</p>
        <div className="flex flex-wrap justify-center gap-8">
          {n.figures.map((fig) => (
            <figure key={fig.caption} className="flex flex-col items-center gap-2">
              <CubeDiagram
                puzzleType="pyraminx"
                state={fig.state}
                outline={fig.outline}
                labels={fig.labels}
                size={180}
              />
              <figcaption className="text-sm text-text-secondary">{fig.caption}</figcaption>
            </figure>
          ))}
        </div>
        <p className="text-text-secondary text-sm">{n.directions}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {n.moves.map((m) => (
            <figure key={m.notation} className="flex flex-col items-center gap-2 bg-surface border border-border rounded-lg p-3">
              <CubeDiagram
                puzzleType="pyraminx"
                state={n.state}
                view={n.view}
                animation={m.animation}
                size={140}
              />
              <MoveSequence notation={m.notation} neutral />
              <figcaption className="text-xs text-text-secondary">{m.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
