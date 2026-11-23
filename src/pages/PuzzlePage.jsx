import { useParams, Link } from 'react-router-dom'
import { getPuzzleBySlug } from '../data/puzzles'
import { getNotation } from '../data/notations'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import CubeDiagram from '../components/diagrams/CubeDiagram'
import MoveSequence from '../components/notation/MoveSequence'
import { createSolvedState } from '../lib/cubeState'

export default function PuzzlePage() {
  const { puzzleSlug } = useParams()
  const puzzle = getPuzzleBySlug(puzzleSlug)
  const notation = getNotation(puzzleSlug)

  if (!puzzle) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Puzzle not found</h2>
        <Link to="/" className="text-accent hover:underline">Back to all puzzles</Link>
      </div>
    )
  }

  const state = puzzle.type !== 'pyraminx' ? createSolvedState(puzzle.dimensions) : null

  return (
    <div>
      <Breadcrumbs items={[
        { label: 'Puzzles', to: '/' },
        { label: puzzle.name },
      ]} />

      <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
        <div className="flex-shrink-0">
          {state ? (
            <CubeDiagram
              puzzleType={puzzle.type}
              dimensions={puzzle.dimensions}
              state={state}
              size={200}
            />
          ) : (
            <div className="text-6xl text-center w-[200px] h-[200px] flex items-center justify-center">
              🔺
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">{puzzle.name}</h1>
          <p className="text-text-secondary mb-4">{puzzle.description}</p>
          <div className="flex gap-4 text-sm text-text-muted">
            <span>{puzzle.pieceCount} pieces</span>
          </div>
        </div>
      </div>

      {notation && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Notation</h2>
          <div className="space-y-4">
            {notation.groups.map((group) => (
              <div key={group.label} className="bg-surface-raised border border-border rounded-lg p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-2">{group.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.moves.map((move) => (
                    <div key={move} className="flex flex-col items-center gap-1">
                      <MoveSequence notation={move} />
                      <MoveSequence notation={`${move}'`} />
                      {notation.modifiers?.['2'] && (
                        <MoveSequence notation={`${move}2`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Solving Method</h2>
        <div className="bg-surface-raised border border-border rounded-lg p-8 text-center">
          <p className="text-text-muted italic">
            Solving steps coming soon. Check back as we add content!
          </p>
        </div>
      </section>
    </div>
  )
}
