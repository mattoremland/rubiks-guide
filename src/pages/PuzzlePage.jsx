import { useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { getPuzzleBySlug } from '../data/puzzles'
import { getNotation } from '../data/notations'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import CubeDiagram from '../components/diagrams/CubeDiagram'
import MoveSequence from '../components/notation/MoveSequence'
import { createSolvedState, createPyraminxSolvedState } from '../lib/cubeState'
import { getMethod } from '../data/methods'
import AlgorithmCard from '../components/content/AlgorithmCard'
import PuzzleNotation from '../components/content/PuzzleNotation'
import { withEmphasis } from '../lib/emphasis'
import SubStepLabel from '../components/content/SubStepLabel'
import TopPattern from '../components/diagrams/TopPattern'

// Hands out sub-step labels (3a, 3b, ...) in the order items appear within a step.
function labeler(stepNumber) {
  let i = 0
  return () => `${stepNumber}${String.fromCharCode(97 + i++)}`
}

function Caption({ label, children }) {
  return (
    <figcaption className="flex items-start gap-2 text-sm text-text-secondary max-w-xl">
      {label && <SubStepLabel label={label} />}
      {children && <span>{children}</span>}
    </figcaption>
  )
}

export default function PuzzlePage() {
  const { puzzleSlug } = useParams()
  const { hash } = useLocation()
  // a link to a sub-step (#step-6f) scrolls to it once the page has drawn
  useEffect(() => {
    if (!hash) return
    const id = setTimeout(() => {
      // the label sits under its picture, so scroll to the whole figure or card it belongs to
      const label = document.getElementById(hash.slice(1))
      const target = label?.closest('figure') ?? label?.closest('.rounded-xl') ?? label
      target?.scrollIntoView({ block: 'start' })
    }, 50)
    return () => clearTimeout(id)
  }, [hash, puzzleSlug])
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

  const method = getMethod(puzzleSlug)
  const state = method?.previewState ?? createSolvedState(puzzle.dimensions)

  return (
    <div>
      <Breadcrumbs items={[
        { label: 'Puzzles', to: '/' },
        { label: puzzle.name },
      ]} />

      <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
        <div className="flex-shrink-0">
          <CubeDiagram
            puzzleType={puzzle.type}
            dimensions={puzzle.dimensions}
            state={state}
            size={200}
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">{puzzle.name}</h1>
          <p className="text-text-secondary mb-4">{puzzle.description}</p>
          <div className="flex gap-4 text-sm text-text-muted">
            <span>{puzzle.pieceCount} pieces</span>
          </div>
        </div>
      </div>

      {method?.callout && (
        <aside className="mb-10 bg-surface-raised border border-border border-l-4 border-l-accent rounded-lg p-4">
          <p className="text-text-primary text-sm">{withEmphasis(method.callout)}</p>
        </aside>
      )}

      {method?.notation && <PuzzleNotation puzzleType={puzzle.type} notation={method.notation} />}

      {notation && !method?.notation && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Notation</h2>
          <div className="space-y-4">
            {notation.groups.map((group) => (
              <div key={group.label} className="bg-surface-raised border border-border rounded-lg p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-2">{group.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.moves.map((move) => (
                    <div key={move} className="flex flex-col items-center gap-1">
                      <MoveSequence notation={move} neutral={puzzle.type === 'pyraminx'} />
                      <MoveSequence notation={`${move}'`} neutral={puzzle.type === 'pyraminx'} />
                      {notation.modifiers?.['2'] && (
                        <MoveSequence notation={`${move}2`} neutral={puzzle.type === 'pyraminx'} />
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
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          {method ? `Solving Method: ${method.name}` : 'Solving Method'}
        </h2>
        {method ? (
          <div className="space-y-6">
            <p className="text-text-secondary">{method.description}</p>
            {method.stages.map((stage, stageIndex) => {
              const nextLabel = labeler(stageIndex + 1)
              return (
              <div key={stage.slug} className="bg-surface-raised border border-border rounded-lg p-5">
                <h3 className="text-lg font-semibold text-text-primary mb-2">{stage.name}</h3>
                <p className="text-text-secondary text-sm mb-4">{withEmphasis(stage.description)}</p>
                {stage.figures && (
                  <div className="flex flex-wrap justify-center gap-8 mb-6">
                    {stage.figures.map((fig, i) => (
                      <figure key={i} className="flex flex-col items-center gap-2">
                        {fig.patterns ? (
                          // a row of top-face patterns, one sub-step
                          <div className="flex flex-wrap justify-center gap-3">
                            {fig.patterns.map((p, k) => (
                              <TopPattern key={k} pattern={p} color={fig.patternColor} circled={k === fig.circled} />
                            ))}
                          </div>
                        ) : (
                          <CubeDiagram
                            puzzleType={puzzle.type}
                            dimensions={puzzle.dimensions}
                            state={fig.state}
                            outline={fig.outline}
                            view={fig.view}
                            groups={fig.groups}
                            pieces={fig.pieces}
                            highlightColor={fig.highlightColor}
                            size={160}
                          />
                        )}
                        <Caption label={fig.unlabeled ? undefined : nextLabel()}>{withEmphasis(fig.caption)}</Caption>
                      </figure>
                    ))}
                  </div>
                )}
                {stage.setupState && (
                  <figure className="flex flex-col items-center gap-2 mb-4">
                    <CubeDiagram
                      puzzleType={puzzle.type}
                      dimensions={puzzle.dimensions}
                      state={stage.setupState}
                      highlights={stage.highlights}
                      size={160}
                    />
                    <Caption label={nextLabel()} />
                  </figure>
                )}
                {stage.animation && (
                  <figure className="flex flex-col items-center gap-2 mb-4">
                    <CubeDiagram
                      puzzleType={puzzle.type}
                      dimensions={puzzle.dimensions}
                      state={stage.animation.state}
                      animation={stage.animation}
                      view={stage.animation.view}
                      pieces={stage.animation.pieces}
                      size={180}
                    />
                    <Caption label={nextLabel()}>{stage.animation.caption}</Caption>
                  </figure>
                )}
                {stage.footer && (
                  <p className="text-text-secondary text-sm mb-4">{withEmphasis(stage.footer)}</p>
                )}
                {stage.note && (
                  <p className="text-text-secondary text-sm mb-4">{withEmphasis(stage.note)}</p>
                )}
                {stage.algorithms.length > 0 && (
                  <div className="space-y-4">
                    {stage.algorithms.map((alg, i) => (
                      <AlgorithmCard
                        key={i}
                        algorithm={alg}
                        puzzleType={puzzle.type}
                        dimensions={puzzle.dimensions}
                        label={nextLabel()}
                      />
                    ))}
                  </div>
                )}
                {[stage.closing].flat().filter(Boolean).map((closing, ci) => (
                  <div key={ci} className="mt-6">
                    {closing.text && (
                      <p className="text-text-secondary text-sm mb-4">{withEmphasis(closing.text)}</p>
                    )}
                    {(closing.figures ?? (closing.figure ? [closing.figure] : [])).map((fig, i) => (
                      <figure key={i} className="flex flex-col items-center gap-2 mb-4">
                        <CubeDiagram
                          puzzleType={puzzle.type}
                          dimensions={puzzle.dimensions}
                          state={fig.state}
                          bottomBand={fig.bottomBand}
                          animation={fig.animation}
                          view={fig.view}
                          groups={fig.groups}
                          pieces={fig.pieces}
                          highlightColor={fig.highlightColor}
                          size={fig.animation ? 180 : 160}
                        />
                        <Caption label={nextLabel()}>{withEmphasis(fig.caption)}</Caption>
                      </figure>
                    ))}
                    {closing.algorithms?.length > 0 && (
                      <div className="space-y-4">
                        {closing.algorithms.map((alg, i) => (
                          <AlgorithmCard
                            key={i}
                            algorithm={alg}
                            puzzleType={puzzle.type}
                            dimensions={puzzle.dimensions}
                            label={nextLabel()}
                          />
                        ))}
                      </div>
                    )}
                    {closing.textAfter && (
                      <p className="text-text-secondary text-sm mt-4">{withEmphasis(closing.textAfter)}</p>
                    )}
                  </div>
                ))}
              </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-surface-raised border border-border rounded-lg p-8 text-center">
            <p className="text-text-muted italic">
              Solving steps coming soon. Check back as we add content!
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
