import { Link } from 'react-router-dom'
import CubeDiagram from '../diagrams/CubeDiagram'
import { createSolvedState } from '../../lib/cubeState'
import { getMethod } from '../../data/methods'

const difficultyLabels = ['', 'Easy', 'Easy', 'Medium', 'Medium', 'Hard', 'Expert']

export default function PuzzleCard({ puzzle }) {
  const state = getMethod(puzzle.slug)?.previewState ?? createSolvedState(puzzle.dimensions)

  return (
    <Link
      to={`/puzzle/${puzzle.slug}`}
      className="group block bg-surface-raised border border-border rounded-xl p-6 hover:border-accent/50 hover:bg-surface-hover transition-all"
    >
      <div className="flex items-center justify-center mb-4 h-32">
        <CubeDiagram
          puzzleType={puzzle.type}
          dimensions={puzzle.dimensions}
          state={state}
          size={120}
        />
      </div>
      <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
        {puzzle.name}
      </h3>
      <p className="text-sm text-text-secondary mt-1">{puzzle.description}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
          {difficultyLabels[puzzle.difficulty] || 'Medium'}
        </span>
        <span className="text-xs text-text-muted">
          {puzzle.pieceCount} pieces
        </span>
      </div>
    </Link>
  )
}
