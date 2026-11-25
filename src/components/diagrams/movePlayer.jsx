import { createContext, useEffect, useMemo, useState } from 'react'
import { getStickerColor, shadedColor } from '../../data/colors'

// Animations write each move's letter beside the puzzle; turned off where the move is
// already named under the picture (the notation cards).
export const MoveLettersContext = createContext(true)

export const ptsStr = (points) => points.map(p => `${p.x},${p.y}`).join(' ')
export const glow = { filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.6))' }
export const shadow = { filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.8))' }

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// Ordered phases of one play-through. Each has a duration, the move it belongs to
// (moves.length = finished), and what it animates: 'spin' turns that move, 'outlineIn' /
// 'outlineOut' fade the outline of the layer about to turn, 'pauseIn' / 'pauseHold' / 'pauseOut'
// stop after one move to point something out, 'highlightIn' fades in the end highlight, and
// 'fadeOut' / 'fadeIn' return to the beginning.
function buildTimeline(moveCount, outlineMoves, withHighlight, firstRest, pauseAfter) {
  const single = moveCount === 1
  // long sequences (e.g. a trigger repeated three times) move along faster
  const long = moveCount > 4
  const phases = []
  for (let k = 0; k < moveCount; k++) {
    phases.push({ k, kind: 'rest', ms: k === 0 ? (firstRest ?? (outlineMoves ? 400 : 800)) : long ? 200 : 300 })
    if (outlineMoves) {
      phases.push({ k, kind: 'outlineIn', ms: long ? 200 : 300 })
      phases.push({ k, kind: 'outlineHold', ms: single ? 900 : long ? 350 : 600 })
      phases.push({ k, kind: 'outlineOut', ms: long ? 150 : 250 })
    }
    phases.push({ k, kind: 'spin', ms: single ? 1000 : long ? 650 : 900 })
    if (k === pauseAfter) {
      phases.push({ k: k + 1, kind: 'rest', ms: 300 })
      phases.push({ k: k + 1, kind: 'pauseIn', ms: 350 })
      phases.push({ k: k + 1, kind: 'pauseHold', ms: 1800 })
      phases.push({ k: k + 1, kind: 'pauseOut', ms: 350 })
    }
  }
  if (withHighlight) {
    phases.push({ k: moveCount, kind: 'rest', ms: 450 })
    phases.push({ k: moveCount, kind: 'highlightIn', ms: 350 })
  }
  // hold the end position, then fade back to the start (looping animations then play again;
  // the others wait on the starting frame for Replay)
  phases.push({ k: moveCount, kind: 'rest', ms: withHighlight ? 2000 : 1500 })
  phases.push({ k: moveCount, kind: 'fadeOut', ms: 350 })
  phases.push({ k: 0, kind: 'fadeIn', ms: 350 })
  return phases
}

// `before` is 1 while the first move has not started yet (for a highlight of the starting position);
// `pause` fades the highlight shown while stopped part-way through.
const START_FRAME = { k: 0, angle: 0, outline: 0, highlight: 0, opacity: 1, before: 1, pause: 0, spin: false }

// `angles[k]` is the full turn angle of move k, in radians.
function frameAt(phases, t, angles) {
  const highlightAt = phases.findIndex(q => q.kind === 'highlightIn')
  const firstSpin = phases.findIndex(q => q.kind === 'spin')
  let start = 0
  for (const [i, p] of phases.entries()) {
    if (t < start + p.ms) {
      const u = (t - start) / p.ms
      const before = i < firstSpin || p.kind === 'fadeIn' ? 1 : 0
      const f = { k: p.k, angle: 0, outline: 0, highlight: 0, opacity: 1, before, pause: 0, spin: p.kind === 'spin' }
      if (p.kind === 'spin') f.angle = angles[p.k] * easeInOut(u)
      if (p.kind === 'outlineIn') f.outline = u
      if (p.kind === 'outlineHold') f.outline = 1
      if (p.kind === 'outlineOut') f.outline = 1 - u
      if (p.kind === 'pauseIn') f.pause = u
      if (p.kind === 'pauseHold') f.pause = 1
      if (p.kind === 'pauseOut') f.pause = 1 - u
      if (p.kind === 'highlightIn') f.highlight = u
      if (highlightAt >= 0 && i > highlightAt && p.kind !== 'fadeIn') f.highlight = 1
      if (p.kind === 'fadeOut') f.opacity = 1 - u
      if (p.kind === 'fadeIn') f.opacity = u
      return f
    }
    start += p.ms
  }
  return START_FRAME
}

// Plays the moves once each time `play` is called, then returns to the starting position;
// with `animation.loop` it repeats forever once started. `animation.pause`: { after: k } stops
// after move k (from 0) to show a highlight. `angles` must be memoized.
export function useMovePlayer(animation, angles) {
  const withHighlight = !!animation?.highlightAfter
  const loop = !!animation?.loop
  const phases = useMemo(
    // hold longer on the starting position when it is highlighted
    () => angles && buildTimeline(angles.length, !!animation.outlineMoves, withHighlight, animation.firstRest ?? (animation.highlightBefore ? 2000 : undefined), animation.pause?.after),
    [angles, animation, withHighlight],
  )
  const [frame, setFrame] = useState(START_FRAME)
  const [playCount, setPlayCount] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!phases || playCount === 0) return
    const total = phases.reduce((a, p) => a + p.ms, 0)
    let raf
    const start = performance.now()
    setPlaying(true)
    const tick = (now) => {
      const t = loop ? (now - start) % total : now - start
      setFrame(frameAt(phases, t, angles))
      if (loop || t < total) raf = requestAnimationFrame(tick)
      else setPlaying(false)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phases, angles, playCount, withHighlight, loop])

  return { frame, playing, played: playCount > 0, play: () => setPlayCount(c => c + 1) }
}

// Calls `onVisible` once, the first time the element is mostly on screen.
export function useFirstVisible(ref, enabled, onVisible) {
  useEffect(() => {
    if (!enabled || !ref.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect()
        onVisible()
      }
    }, { threshold: 0.6 })
    observer.observe(ref.current)
    return () => observer.disconnect()
    // onVisible only needs to fire once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])
}

export function Polygons({ polys, strokeWidth = 1 }) {
  return polys.map((p, i) => (
    <polygon
      key={i}
      points={ptsStr(p.points)}
      fill={p.color ? shadedColor(getStickerColor(p.color), p.shade) : '#1a1a2e'}
      stroke="#1a1a2e"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  ))
}

// Turn arrow (from arrowPaths): arc and arrowhead in one piece, with a dark edge around both so it
// stands out on any sticker color.
export function OutlinedArrow({ arrow }) {
  const parts = (color, width) => (
    <g stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      <path d={arrow.shaft} fill="none" />
      <path d={arrow.head} fill={color} />
    </g>
  )
  return (
    <>
      {parts('#1a1a2e', 5.5)}
      {parts('#FFD700', 2.5)}
    </>
  )
}

// The letter of the move being made, beside the part that turns.
export function MoveLetter({ at, text, opacity = 1 }) {
  return (
    <text
      x={at.x}
      y={at.y}
      textAnchor="middle"
      dominantBaseline="central"
      fill="#FFFFFF"
      stroke="#1a1a2e"
      strokeWidth={5}
      paintOrder="stroke"
      fontSize={24}
      fontWeight={800}
      fontFamily="ui-monospace, monospace"
      opacity={opacity}
    >
      {text}
    </text>
  )
}

export function ReplayButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-secondary disabled:cursor-default"
    >
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
        <path d="M13 8a5 5 0 1 1-1.5-3.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12.5 1.5v3.5H9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Replay
    </button>
  )
}

// Grows a viewBox to include extra bounds.
export function growBox(box, b, pad) {
  box.minX = Math.min(box.minX, b.minX - pad)
  box.minY = Math.min(box.minY, b.minY - pad)
  box.maxX = Math.max(box.maxX, b.maxX + pad)
  box.maxY = Math.max(box.maxY, b.maxY + pad)
}

export const viewBoxOf = (box) => `${box.minX} ${box.minY} ${box.maxX - box.minX} ${box.maxY - box.minY}`
