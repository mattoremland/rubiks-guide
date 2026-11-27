import CubeDiagram from '../diagrams/CubeDiagram'
import MoveSequence from '../notation/MoveSequence'
import SubStepLabel from './SubStepLabel'
import { withEmphasis } from '../../lib/emphasis'

export default function AlgorithmCard({ algorithm, puzzleType, dimensions, label }) {
  return (
    <div className="bg-surface-raised border border-border rounded-xl p-5 transition-colors hover:border-accent hover:bg-surface-hover/50">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-shrink-0">
          <CubeDiagram
            puzzleType={puzzleType}
            dimensions={dimensions}
            state={algorithm.setupState}
            highlights={algorithm.highlights}
            size={180}
            animation={algorithm.animation}
            view={algorithm.view}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="flex items-center gap-2 text-base font-semibold text-text-primary">
            {label && <SubStepLabel label={label} />}
            {algorithm.name}
          </h4>
          {algorithm.caseDescription && (
            <p className="text-sm text-text-secondary mt-1">
              {withEmphasis(algorithm.caseDescription)}
            </p>
          )}
          <div className="mt-3">
            <MoveSequence notation={algorithm.moves} />
          </div>
          {algorithm.tips && (
            <p className="text-xs text-text-muted mt-3 italic">
              {withEmphasis(algorithm.tips)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
