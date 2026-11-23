import { useEffect, useMemo, useRef, useState } from 'react'
import { getFaceStickers, getVisibleFaces, getPyraFaceShading } from '../../lib/pyraminxGeometry'
import {
  applyTurn, getTurnPolygons, getPuzzlePolygons, getTurnArrow, getLayerOutline,
  getStickerGroupOutline, getBottomBandOutline, getViewBounds, getCornerLabelPoint, DEFAULT_VIEW,
} from '../../lib/pyraminx3d'
import { getSticker, getHighlight } from '../../lib/cubeState'
import { getStickerColor, shadedColor } from '../../data/colors'
import IsoSticker from './IsoSticker'

const PAD = 25
const ARROW_PAD = 8
const STEP = 2 * Math.PI / 3

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// Ordered phases of one play-through. Each has a duration, the move it belongs to
// (moves.length = finished), and what it animates: 'spin' turns that move, 'outlineIn' /
// 'outlineOut' fade the corner outline, 'highlightIn' fades in the end highlight, and for
// looping animations 'fadeOut' / 'fadeIn' restart from the beginning.
function buildTimeline(moveCount, outlineMoves, withHighlight, loop) {
  const single = moveCount === 1
  const phases = []
  for (let k = 0; k < moveCount; k++) {
    phases.push({ k, kind: 'rest', ms: k === 0 ? (outlineMoves ? 400 : 800) : 300 })
    if (outlineMoves) {
      phases.push({ k, kind: 'outlineIn', ms: 300 })
      phases.push({ k, kind: 'outlineHold', ms: single ? 900 : 600 })
      phases.push({ k, kind: 'outlineOut', ms: 250 })
    }
    phases.push({ k, kind: 'spin', ms: single ? 1000 : 900 })
  }
  if (withHighlight) {
    phases.push({ k: moveCount, kind: 'rest', ms: 450 })
    phases.push({ k: moveCount, kind: 'highlightIn', ms: 350 })
  }
  if (loop) {
    phases.push({ k: moveCount, kind: 'rest', ms: withHighlight ? 2000 : 1500 })
    phases.push({ k: moveCount, kind: 'fadeOut', ms: 350 })
    phases.push({ k: 0, kind: 'fadeIn', ms: 350 })
  }
  return phases
}

const START_FRAME = { k: 0, angle: 0, outline: 0, highlight: 0, opacity: 1 }

function frameAt(phases, t, dirs, withHighlight) {
  let start = 0
  for (const p of phases) {
    if (t < start + p.ms) {
      const u = (t - start) / p.ms
      const f = { k: p.k, angle: 0, outline: 0, highlight: 0, opacity: 1 }
      if (p.kind === 'spin') f.angle = dirs[p.k] * STEP * easeInOut(u)
      if (p.kind === 'outlineIn') f.outline = u
      if (p.kind === 'outlineHold') f.outline = 1
      if (p.kind === 'outlineOut') f.outline = 1 - u
      if (p.kind === 'highlightIn') f.highlight = u
      const highlightAt = phases.findIndex(q => q.kind === 'highlightIn')
      if (highlightAt >= 0 && phases.indexOf(p) > highlightAt && p.kind !== 'fadeIn') f.highlight = 1
      if (p.kind === 'fadeOut') f.opacity = 1 - u
      if (p.kind === 'fadeIn') f.opacity = u
      return f
    }
    start += p.ms
  }
  return { k: dirs.length, angle: 0, outline: 0, highlight: withHighlight ? 1 : 0, opacity: 1 }
}

// Plays the moves once each time `play` is called, then holds the final position;
// with `animation.loop` it repeats forever once started.
function useMovePlayer(animation) {
  const moves = animation?.moves
  const withHighlight = !!animation?.highlightAfter
  const loop = !!animation?.loop
  const phases = useMemo(
    () => moves && buildTimeline(moves.length, !!animation.outlineMoves, withHighlight, loop),
    [moves, animation, withHighlight, loop],
  )
  const [frame, setFrame] = useState(START_FRAME)
  const [playCount, setPlayCount] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!phases || playCount === 0) return
    const total = phases.reduce((a, p) => a + p.ms, 0)
    const dirs = moves.map(m => m.dir)
    let raf
    const start = performance.now()
    setPlaying(true)
    const tick = (now) => {
      const t = loop ? (now - start) % total : now - start
      setFrame(frameAt(phases, t, dirs, withHighlight))
      if (loop || t < total) raf = requestAnimationFrame(tick)
      else setPlaying(false)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phases, moves, playCount, withHighlight, loop])

  return { frame, playing, played: playCount > 0, play: () => setPlayCount(c => c + 1) }
}

// Calls `onVisible` once, the first time the element is mostly on screen.
function useFirstVisible(ref, enabled, onVisible) {
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

const ptsStr = (points) => points.map(p => `${p.x},${p.y}`).join(' ')

const glow = { filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.6))' }

function StaticBody({ state, highlights }) {
  return getVisibleFaces().map((face) => {
    const shade = getPyraFaceShading(face)
    return (
      <g key={face}>
        {getFaceStickers(face).map((s) => (
          <IsoSticker
            key={`${face}-${s.index}`}
            points={s.points}
            color={getSticker(state, face, s.index)}
            highlight={getHighlight(highlights, face, s.index)}
            shadeFactor={shade}
          />
        ))}
      </g>
    )
  })
}

function Polygons({ polys }) {
  return polys.map((p, i) => (
    <polygon
      key={i}
      points={ptsStr(p.points)}
      fill={p.color ? shadedColor(getStickerColor(p.color), p.shade) : '#1a1a2e'}
      stroke="#1a1a2e"
      strokeWidth={1}
      strokeLinejoin="round"
    />
  ))
}

// `animation`: { moves: [{ vertex, layer: 'tip' | 'big', dir }], outlineMoves?, highlightAfter?: [{ face, indices }] }
// plays the moves once from `state` (when first scrolled into view, then on Replay), optionally outlining each corner before it turns and outlining sticker
// groups at the end. `view`: { x, y } camera angles in degrees. `outline`: { vertex, layer } circles a corner;
// `bottomBand` outlines the bottom third of the side faces; `groups`: [{ face, indices }] outlines stickers;
// `labels`: { vertex: text } names corners.
export default function IsoPyraminx({ state, highlights, size = 200, animation, view, outline, bottomBand, groups, labels }) {
  const moves = animation?.moves
  const v = view ?? DEFAULT_VIEW
  const { frame, playing, played, play } = useMovePlayer(animation)
  const wrapper = useRef(null)
  useFirstVisible(wrapper, !!moves, play)

  const states = useMemo(() => {
    if (!moves) return null
    const list = [state]
    for (const m of moves) list.push(applyTurn(list[list.length - 1], m.vertex, m.layer, m.dir))
    return list
  }, [state, moves])

  const arrows = useMemo(() => moves?.map(m => getTurnArrow(m.vertex, m.dir, v)) ?? [], [moves, v])

  const b = getViewBounds(v)
  const box = { minX: b.minX - PAD, minY: b.minY - PAD, maxX: b.maxX + PAD, maxY: b.maxY + PAD }
  for (const a of arrows) {
    box.minX = Math.min(box.minX, a.bounds.minX - ARROW_PAD)
    box.minY = Math.min(box.minY, a.bounds.minY - ARROW_PAD)
    box.maxX = Math.max(box.maxX, a.bounds.maxX + ARROW_PAD)
    box.maxY = Math.max(box.maxY, a.bounds.maxY + ARROW_PAD)
  }
  const labelPoints = labels ? Object.entries(labels).map(([vertex, text]) => ({ text, ...getCornerLabelPoint(vertex, v) })) : []
  for (const p of labelPoints) {
    box.minX = Math.min(box.minX, p.x - 14)
    box.minY = Math.min(box.minY, p.y - 14)
    box.maxX = Math.max(box.maxX, p.x + 14)
    box.maxY = Math.max(box.maxY, p.y + 14)
  }
  const viewBox = `${box.minX} ${box.minY} ${box.maxX - box.minX} ${box.maxY - box.minY}`

  let body
  if (moves) {
    const { k, angle } = frame
    const m = moves[k]
    body = <Polygons polys={m ? getTurnPolygons(states[k], m.vertex, m.layer, angle, v) : getPuzzlePolygons(states[k], v)} />
  } else if (view) {
    body = <Polygons polys={getPuzzlePolygons(state, v)} />
  } else {
    body = <StaticBody state={state} highlights={highlights} />
  }

  const finished = moves && frame.k >= moves.length
  const currentMove = moves && !finished && moves[frame.k]
  const arrow = moves && !finished && arrows[frame.k]

  const svg = (
    <svg viewBox={viewBox} width={size} height={size} className="block">
      <g style={{ opacity: frame.opacity }}>
        {body}
        {currentMove && frame.outline > 0 && (
          <polygon
            points={ptsStr(getLayerOutline(currentMove.vertex, currentMove.layer, v))}
            fill="rgba(255, 255, 255, 0.12)"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinejoin="round"
            opacity={frame.outline}
            style={glow}
          />
        )}
        {animation?.highlightAfter && frame.highlight > 0 && animation.highlightAfter.map((g, i) => (
          <polygon
            key={i}
            points={ptsStr(getStickerGroupOutline(g.face, g.indices, v))}
            fill="rgba(255, 255, 255, 0.12)"
            stroke="#FFFFFF"
            strokeWidth={2.5}
            strokeLinejoin="round"
            opacity={frame.highlight}
            style={glow}
          />
        ))}
      </g>
      {outline && (
        <polygon
          points={ptsStr(getLayerOutline(outline.vertex, outline.layer, v))}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.8))' }}
        />
      )}
      {groups?.map((g, i) => (
        <polygon
          key={i}
          points={ptsStr(getStickerGroupOutline(g.face, g.indices, v))}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2.5}
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.8))' }}
        />
      ))}
      {labelPoints.map((p) => (
        <text
          key={p.text}
          x={p.x}
          y={p.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#FFD700"
          fontSize={18}
          fontWeight={700}
          fontFamily="ui-monospace, monospace"
        >
          {p.text}
        </text>
      ))}
      {bottomBand && (
        <polygon
          points={ptsStr(getBottomBandOutline(v))}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.8))' }}
        />
      )}
      {arrow && (
        <>
          <defs>
            <marker id="turn-arrowhead" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0,0 8,3 0,6" fill="#FFD700" />
            </marker>
          </defs>
          <path
            d={arrow.d}
            fill="none"
            stroke="#FFD700"
            strokeWidth={2.5}
            strokeLinecap="round"
            markerEnd="url(#turn-arrowhead)"
            opacity={0.9}
          />
        </>
      )}
    </svg>
  )

  if (!moves) return svg
  if (animation.loop) return <div ref={wrapper}>{svg}</div>

  return (
    <div ref={wrapper} className="flex flex-col items-center gap-1">
      {svg}
      <button
        type="button"
        onClick={play}
        disabled={playing || !played}
        className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-secondary disabled:cursor-default"
      >
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path d="M13 8a5 5 0 1 1-1.5-3.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12.5 1.5v3.5H9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Replay
      </button>
    </div>
  )
}
