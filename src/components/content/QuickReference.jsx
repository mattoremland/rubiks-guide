import { useState } from 'react'
import MoveSequence from '../notation/MoveSequence'
import CubeDiagram from '../diagrams/CubeDiagram'
import TopPattern from '../diagrams/TopPattern'
import SubStepLabel from './SubStepLabel'
import { withEmphasis } from '../../lib/emphasis'

// Scrolls to a step or sub-step on this page (a label sits under its picture, so go to the whole
// figure or card) and puts it in the address bar, so the link can be shared.
function jump(e, id) {
  e.preventDefault()
  const el = document.getElementById(id)
  const target = el?.closest('figure') ?? el?.closest('.rounded-xl') ?? el
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(null, '', `#${id}`)
}

// The algorithms of every step on one card, for when you already know the method.
// Each step lists `quick: [{ label, moves, ref, state, groups }]` (ref is the sub-step with the
// full example; state and groups draw a small picture of the case, outlining what is being solved)
// and may add a one-line `quickNote`. An item with only `heading` starts a sub-group of the step.
// The section starts closed (it is for people who already know the method); opening or closing it
// is remembered in this browser for each puzzle (`storageKey`).
export default function QuickReference({ stages, puzzleType, dimensions, storageKey }) {
  const key = `quickref-open:${storageKey}`
  const [open, setOpen] = useState(() => localStorage.getItem(key) === 'true')
  const toggle = () => {
    localStorage.setItem(key, String(!open))
    setOpen(!open)
  }
  const steps = stages.filter(s => s.quick || s.quickNote)
  if (steps.length === 0) return null
  return (
    <section className="mb-10">
      <h2 className="mb-1">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="flex items-center gap-2 text-xl font-semibold text-text-primary hover:text-accent"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" className={`w-4 h-4 fill-current transition-transform ${open ? 'rotate-90' : ''}`}>
            <path d="M7 4l7 6-7 6z" />
          </svg>
          Quick Reference
          <span className="text-sm font-normal text-text-muted">{open ? '(click to hide)' : '(click to show)'}</span>
        </button>
      </h2>
      <p className="text-sm text-text-muted mb-4">
        The algorithms to remember, at a glance{open ? '. Click a label to jump to its full example.' : ', for when you already know how to solve it.'}
      </p>
      {open && (
      <div className="bg-surface-raised border border-border rounded-lg divide-y divide-border">
        {steps.map(stage => (
          <div key={stage.slug} className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              <a href={`#stage-${stage.slug}`} onClick={e => jump(e, `stage-${stage.slug}`)} className="hover:text-accent">{stage.name}</a>
            </h3>
            {stage.quickNote && <p className="text-sm text-text-secondary mb-2">{withEmphasis(stage.quickNote)}</p>}
            {stage.quick && (
              <ul className="space-y-2">
                {stage.quick.map(item => item.heading ? (
                  <li key={item.heading} className="pt-3 text-sm font-medium text-text-primary">{withEmphasis(item.heading)}</li>
                ) : (
                  <li key={item.label} className="flex flex-col gap-2 sm:grid sm:gap-x-4 sm:gap-y-1 sm:grid-cols-[minmax(0,16rem)_auto_1fr] sm:items-center">
                    <span className="flex items-center gap-2 text-sm text-text-secondary">
                      {item.ref && (
                        <a href={`#step-${item.ref}`} onClick={e => jump(e, `step-${item.ref}`)} aria-label={`Example ${item.ref}`}>
                          <SubStepLabel label={item.ref} anchor={false} />
                        </a>
                      )}
                      {item.label}
                    </span>
                    {item.pattern && (
                      <span>
                        <TopPattern pattern={item.pattern} color={item.patternColor} size={64} />
                      </span>
                    )}
                    {item.state && (
                      <span>
                        <CubeDiagram
                          puzzleType={puzzleType}
                          dimensions={dimensions}
                          state={item.state}
                          groups={item.groups}
                          view={item.view}
                          size={96}
                        />
                      </span>
                    )}
                    <span className="flex flex-wrap gap-1">
                      <MoveSequence notation={item.moves} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      )}
    </section>
  )
}
