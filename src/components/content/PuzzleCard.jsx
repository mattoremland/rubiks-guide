import { Link } from 'react-router-dom'
import CubeDiagram from '../diagrams/CubeDiagram'
import { createSolvedState } from '../../lib/cubeState'
import { getMethod } from '../../data/methods'

import DifficultyBadge from './DifficultyBadge'

export default function PuzzleCard({ puzzle }) {
  const state = getMethod(puzzle.slug)?.previewState ?? createSolvedState(puzzle.dimensions)

  return (
    <Link
      to={`/puzzle/${puzzle.slug}`}
      className="group relative block bg-surface-raised border border-border rounded-xl p-6 hover:border-accent/50 hover:bg-surface-hover transition-all"
    >
      {/* the difficulty sits in the corner beside the picture, so the card stays short */}
      <DifficultyBadge difficulty={puzzle.difficulty} className="absolute top-3 right-3" />
      <div className="flex items-center justify-center mb-4 h-32">
        <CubeDiagram
          puzzleType={puzzle.type}
          dimensions={puzzle.dimensions}
          state={state}
          size={120}
        />
      </div>
      <h3 className="text-lg font-semibold text-center text-text-primary group-hover:text-accent transition-colors">
        {puzzle.name}
      </h3>
    </Link>
  )
}
