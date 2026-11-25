import { useContext, useMemo, useRef } from 'react'
import { getFaceStickers, getVisibleFaces, getPyraFaceShading } from '../../lib/pyraminxGeometry'
import {
  applyTurn, getTurnPolygons, getPuzzlePolygons, getTurnArrow, getLayerOutline,
  getStickerGroupOutline, getBottomBandOutline, getViewBounds, getCornerLabelPoint, getTurnLabelPoint, turnName, DEFAULT_VIEW,
} from '../../lib/pyraminx3d'
import { getSticker, getHighlight } from '../../lib/cubeState'
import IsoSticker from './IsoSticker'
import {
  useMovePlayer, useFirstVisible, MoveLettersContext, Polygons, OutlinedArrow, MoveLetter, ReplayButton, ptsStr, glow, shadow, growBox, viewBoxOf,
} from './movePlayer'

const PAD = 25
const ARROW_PAD = 8
const STEP = 2 * Math.PI / 3

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

// `animation`: { moves: [{ vertex, layer: 'tip' | 'big', dir }], outlineMoves?, highlightAfter?: [{ face, indices }] }
// plays the moves once from `state` (when first scrolled into view, then on Replay, or looping with `loop`),
// optionally outlining each corner before it turns and outlining sticker groups at the end. `view`: { x, y } camera angles in degrees. `outline`: { vertex, layer } circles a corner;
// `bottomBand` outlines the bottom third of the side faces; `groups`: [{ face, indices }] outlines stickers;
// `labels`: { vertex: text } names corners.
export default function IsoPyraminx({ state, highlights, size = 200, animation, view, outline, bottomBand, groups, labels }) {
  const moves = animation?.moves
  const v = view ?? DEFAULT_VIEW
  const angles = useMemo(() => moves?.map(m => m.dir * STEP), [moves])
  const { frame, playing, played, play } = useMovePlayer(animation, angles)
  const wrapper = useRef(null)
  useFirstVisible(wrapper, !!moves, play)

  const states = useMemo(() => {
    if (!moves) return null
    const list = [state]
    for (const m of moves) list.push(applyTurn(list[list.length - 1], m.vertex, m.layer, m.dir))
    return list
  }, [state, moves])

  const arrows = useMemo(() => moves?.map(m => getTurnArrow(m.vertex, m.dir, v)) ?? [], [moves, v])
  // each move's letter beside the corner that turns
  // `animation.moveLetters: false` leaves them out (a turn with no letter in the notation)
  const letters = useContext(MoveLettersContext) && animation?.moveLetters !== false
  const moveLabels = useMemo(() => (letters && moves ? moves.map(m => getTurnLabelPoint(m.vertex, m.dir, v)) : []), [letters, moves, v])

  const b = getViewBounds(v)
  const box = { minX: b.minX - PAD, minY: b.minY - PAD, maxX: b.maxX + PAD, maxY: b.maxY + PAD }
  for (const a of arrows) growBox(box, a.bounds, ARROW_PAD)
  for (const p of moveLabels) growBox(box, { minX: p.x, maxX: p.x, minY: p.y, maxY: p.y }, 18)
  const labelPoints = labels ? Object.entries(labels).map(([vertex, text]) => ({ text, ...getCornerLabelPoint(vertex, v) })) : []
  for (const p of labelPoints) growBox(box, { minX: p.x, maxX: p.x, minY: p.y, maxY: p.y }, 14)
  const viewBox = viewBoxOf(box)

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
  // the arrow shows only before the turn (fading with the outline), never during it
  const arrowOpacity = frame.spin ? 0 : animation?.outlineMoves ? frame.outline : 1
  const moveLabel = currentMove && moveLabels[frame.k]

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
          style={shadow}
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
          style={shadow}
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
          style={shadow}
        />
      )}
      {arrow && arrowOpacity > 0 && (
        <g opacity={arrowOpacity}>
          <OutlinedArrow arrow={arrow} />
        </g>
      )}
      {moveLabel && <MoveLetter at={moveLabel} text={turnName(currentMove)} opacity={frame.opacity} />}
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
