import { useMemo, useRef } from 'react'
import {
  applyMove, parseAlg, moveAngle, getTurnPolygons, getCubePolygons, getMoveArrow, getMoveOutlineEdges,
  getStickerGroupOutline, getViewBounds, getFaceLabelPoint, getHiddenFaceLabel, isFaceVisible, DEFAULT_CUBE_VIEW,
} from '../../lib/cube3d'
import {
  useMovePlayer, useFirstVisible, Polygons, TurnArrow, ReplayButton, ptsStr, glow, shadow, growBox, viewBoxOf,
} from './movePlayer'

const PAD = 14
const ARROW_PAD = 8

// `animation`: { alg: "R U R' U'", outlineMoves?, loop?, highlightAfter?: [{ face, indices }] } plays the
// moves from `state` (once when first scrolled into view, then on Replay, or looping with `loop`).
// `view`: { x, y } camera angles in degrees. `groups`: [{ face, indices }] outlines stickers;
// `labels`: { face: text } names the visible faces.
export default function IsoCube3D({ state, size = 200, animation, view, groups, labels }) {
  const v = view ?? DEFAULT_CUBE_VIEW
  const n = Math.round(Math.sqrt(state.U.length))
  const moves = useMemo(() => animation && parseAlg(animation.alg), [animation])
  const angles = useMemo(() => moves?.map(moveAngle), [moves])
  const { frame, playing, played, play } = useMovePlayer(animation, angles)
  const wrapper = useRef(null)
  useFirstVisible(wrapper, !!moves, play)

  const states = useMemo(() => {
    if (!moves) return null
    const list = [state]
    for (const m of moves) list.push(applyMove(list[list.length - 1], m))
    return list
  }, [state, moves])

  const arrows = useMemo(() => moves?.map(m => getMoveArrow(m, v)) ?? [], [moves, v])

  const b = getViewBounds(v)
  const box = { minX: b.minX - PAD, minY: b.minY - PAD, maxX: b.maxX + PAD, maxY: b.maxY + PAD }
  for (const a of arrows) growBox(box, a.bounds, ARROW_PAD)
  // visible faces are labeled in place; hidden ones get a label outside the cube with a pointer
  const labelPoints = labels
    ? Object.entries(labels).map(([face, text]) => {
      if (isFaceVisible(face, v)) return { text, ...getFaceLabelPoint(face, v) }
      // keep the label away from the head of the first turn arrow
      const side = arrows[0] && (arrows[0].end.x > 0 ? 'left' : 'right')
      const h = getHiddenFaceLabel(face, v, side)
      return { text, ...h.text, pointer: { from: h.from, to: h.to } }
    })
    : []
  for (const p of labelPoints) growBox(box, { minX: p.x, maxX: p.x, minY: p.y, maxY: p.y }, 16)

  let polys
  if (moves) {
    const m = moves[frame.k]
    polys = m ? getTurnPolygons(states[frame.k], m, frame.angle, v) : getCubePolygons(states[frame.k], v)
  } else {
    polys = getCubePolygons(state, v)
  }

  const finished = moves && frame.k >= moves.length
  const currentMove = moves && !finished && moves[frame.k]
  const arrow = moves && !finished && arrows[frame.k]

  const svg = (
    <svg viewBox={viewBoxOf(box)} width={size} height={size} className="block">
      <g style={{ opacity: frame.opacity }}>
        <Polygons polys={polys} strokeWidth={1.5} />
        {currentMove && frame.outline > 0 && (
          <g opacity={frame.outline}>
            {/* hidden edges faint, visible edges solid */}
            {getMoveOutlineEdges(n, currentMove, v).sort((a, b) => a.visible - b.visible).map((e, i) => (
              <line
                key={i}
                x1={e.from.x}
                y1={e.from.y}
                x2={e.to.x}
                y2={e.to.y}
                stroke="#FFFFFF"
                strokeWidth={e.visible ? 3 : 1.5}
                strokeOpacity={e.visible ? 1 : 0.35}
                strokeLinecap="round"
                style={e.visible ? glow : undefined}
              />
            ))}
          </g>
        )}
        {animation?.highlightAfter && frame.highlight > 0 && animation.highlightAfter.map((g, i) => (
          <polygon
            key={i}
            points={ptsStr(getStickerGroupOutline(n, g.face, g.indices, v))}
            fill="rgba(255, 255, 255, 0.12)"
            stroke="#FFFFFF"
            strokeWidth={2.5}
            strokeLinejoin="round"
            opacity={frame.highlight}
            style={glow}
          />
        ))}
      </g>
      {groups?.map((g, i) => (
        <polygon
          key={i}
          points={ptsStr(getStickerGroupOutline(n, g.face, g.indices, v))}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2.5}
          strokeLinejoin="round"
          style={shadow}
        />
      ))}
      {labelPoints.filter(p => p.pointer).map((p) => (
        <line
          key={`pointer-${p.text}`}
          x1={p.pointer.from.x}
          y1={p.pointer.from.y}
          x2={p.pointer.to.x}
          y2={p.pointer.to.y}
          stroke="#FFD700"
          strokeWidth={1.5}
          opacity={0.45}
          markerEnd="url(#label-arrowhead)"
        />
      ))}
      {labelPoints.some(p => p.pointer) && (
        <defs>
          <marker id="label-arrowhead" markerWidth="7" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0,0 7,3 0,6" fill="#FFD700" />
          </marker>
        </defs>
      )}
      {labelPoints.map((p) => (
        <text
          key={p.text}
          x={p.x}
          y={p.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#FFD700"
          stroke="#1a1a2e"
          strokeWidth={5}
          paintOrder="stroke"
          fontSize={22}
          fontWeight={800}
          fontFamily="ui-monospace, monospace"
        >
          {p.text}
        </text>
      ))}
      {arrow && <TurnArrow d={arrow.d} />}
    </svg>
  )

  if (!moves) return svg
  if (animation.loop) return <div ref={wrapper}>{svg}</div>

  return (
    <div ref={wrapper} className="flex flex-col items-center gap-1">
      {svg}
      <ReplayButton onClick={play} disabled={playing || !played} />
    </div>
  )
}
