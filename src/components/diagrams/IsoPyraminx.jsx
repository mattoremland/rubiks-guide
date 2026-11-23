import { useEffect, useState } from 'react'
import { getFaceStickers, getVisibleFaces, getPyraFaceShading } from '../../lib/pyraminxGeometry'
import { getTurnPolygons, getTurnArrow, getLayerOutline, getStickerGroupOutline } from '../../lib/pyraminx3d'
import { getSticker, getHighlight } from '../../lib/cubeState'
import { getStickerColor, shadedColor } from '../../data/colors'
import IsoSticker from './IsoSticker'

const BASE_BOX = { minX: -89, minY: -113, maxX: 108, maxY: 78 }
const PAD = 8

const HOLD_START = 1200
const SPIN = 1000
const HOLD_END = 1500
const HIGHLIGHT_PAUSE = 450
const HIGHLIGHT_IN = 350
const HIGHLIGHT_HOLD = 2000
const BEFORE_PAUSE = 400
const BEFORE_IN = 300
const BEFORE_HOLD = 900
const BEFORE_OUT = 250
const FADE = 350
const STEP = 2 * Math.PI / 3

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const ramp = (t, start, length) => Math.min(1, Math.max(0, (t - start) / length))

// Loop: hold (optionally outlining the layer about to turn), turn, hold (optionally pausing then
// fading in a highlight), fade out, fade back in at the start.
function useTurnLoop(dir, withBefore, withHighlight) {
  const [frame, setFrame] = useState({ angle: 0, opacity: 1, before: 0, highlight: 0 })
  useEffect(() => {
    if (!dir) return
    const holdStart = withBefore ? BEFORE_PAUSE + BEFORE_IN + BEFORE_HOLD + BEFORE_OUT : HOLD_START
    const after = withHighlight ? HIGHLIGHT_PAUSE + HIGHLIGHT_IN + HIGHLIGHT_HOLD : HOLD_END
    const turnEnd = holdStart + SPIN
    const fadeStart = turnEnd + after
    const cycle = fadeStart + FADE * 2
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = (now - start) % cycle
      let progress = 1, opacity = 1, before = 0, highlight = 0
      if (t < holdStart) {
        progress = 0
        if (withBefore) {
          before = ramp(t, BEFORE_PAUSE, BEFORE_IN) - ramp(t, holdStart - BEFORE_OUT, BEFORE_OUT)
        }
      } else if (t < turnEnd) progress = easeInOut((t - holdStart) / SPIN)
      else if (t < fadeStart) {
        if (withHighlight) highlight = Math.min(1, Math.max(0, (t - turnEnd - HIGHLIGHT_PAUSE) / HIGHLIGHT_IN))
      } else if (t < fadeStart + FADE) {
        opacity = 1 - (t - fadeStart) / FADE
        highlight = withHighlight ? 1 : 0
      } else {
        progress = 0
        opacity = (t - fadeStart - FADE) / FADE
      }
      setFrame({ angle: dir * STEP * progress, opacity, before, highlight })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [dir, withBefore, withHighlight])
  return frame
}

const ptsStr = (points) => points.map(p => `${p.x},${p.y}`).join(' ')

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

function TurningBody({ state, turn, angle }) {
  return getTurnPolygons(state, turn.vertex, turn.layer, angle).map((p, i) => (
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

// `turn`: { vertex, layer: 'tip' | 'big', dir, highlightBefore?, highlightAfter?: [{ face, indices }] } loops
// that layer turning, optionally outlining it first and outlining sticker groups once it lands;
// `outline`: { vertex, layer } circles a corner layer.
export default function IsoPyraminx({ state, highlights, size = 200, turn, outline }) {
  const { angle, opacity, before, highlight } = useTurnLoop(turn?.dir, !!turn?.highlightBefore, !!turn?.highlightAfter)
  const arrow = turn && getTurnArrow(turn.vertex, turn.dir)

  const box = { ...BASE_BOX }
  if (arrow) {
    box.minX = Math.min(box.minX, arrow.bounds.minX - PAD)
    box.minY = Math.min(box.minY, arrow.bounds.minY - PAD)
    box.maxX = Math.max(box.maxX, arrow.bounds.maxX + PAD)
    box.maxY = Math.max(box.maxY, arrow.bounds.maxY + PAD)
  }
  const viewBox = `${box.minX} ${box.minY} ${box.maxX - box.minX} ${box.maxY - box.minY}`

  return (
    <svg viewBox={viewBox} width={size} height={size} className="block">
      <g style={{ opacity }}>
        {turn
          ? <TurningBody state={state} turn={turn} angle={angle} />
          : <StaticBody state={state} highlights={highlights} />}
        {turn?.highlightBefore && before > 0 && (
          <polygon
            points={ptsStr(getLayerOutline(turn.vertex, turn.layer))}
            fill="rgba(255, 255, 255, 0.12)"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinejoin="round"
            opacity={before}
            style={{ filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.6))' }}
          />
        )}
        {turn?.highlightAfter && highlight > 0 && turn.highlightAfter.map((g, i) => (
          <polygon
            key={i}
            points={ptsStr(getStickerGroupOutline(g.face, g.indices))}
            fill="rgba(255, 255, 255, 0.12)"
            stroke="#FFFFFF"
            strokeWidth={2.5}
            strokeLinejoin="round"
            opacity={highlight}
            style={{ filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.6))' }}
          />
        ))}
      </g>
      {outline && (
        <polygon
          points={ptsStr(getLayerOutline(outline.vertex, outline.layer))}
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
}
