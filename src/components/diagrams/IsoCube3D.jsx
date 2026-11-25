import { useContext, useMemo, useRef } from 'react'
import {
  applyMove, parseAlg, moveAngle, getTurnPolygons, getCubePolygons, getMoveArrow, getMoveOutlineEdges, getPieceEdges,
  getStickerGroupOutline, getStickerFacingArrow, getViewBounds, getFaceLabelPoint, getHiddenFaceLabel, isFaceVisible, dimsOf,
  getMoveLabelPoint, moveName, DEFAULT_CUBE_VIEW,
} from '../../lib/cube3d'
import {
  useMovePlayer, useFirstVisible, MoveLettersContext, Polygons, OutlinedArrow, MoveLetter, ReplayButton, ptsStr, glow, shadow, growBox, viewBoxOf,
} from './movePlayer'
import { getStickerColor } from '../../data/colors'

const PAD = 14
// cycle arrows are dark with a light glow, so they stand apart from white outlines
const ARROW_DARK = '#0f172a'
const ARROW_PAD = 8

// Box outline: edges you can see solid, hidden edges faint (or left out with `hidden={false}`).
function BoxEdges({ edges, color = '#FFFFFF', hidden = true }) {
  return [...edges].filter(e => hidden || e.visible).sort((a, b) => a.visible - b.visible).map((e, i) => (
    <line
      key={i}
      x1={e.from.x}
      y1={e.from.y}
      x2={e.to.x}
      y2={e.to.y}
      stroke={color}
      strokeWidth={e.visible ? 3 : 1.5}
      strokeOpacity={e.visible ? 1 : 0.35}
      strokeLinecap="round"
      style={e.visible ? glow : undefined}
    />
  ))
}

// Stickers on a hidden face, shown faintly through the cube with an arrow for the way they face.
function Ghost({ dims, group, view, state, color, opacity = 1 }) {
  const arrowPts = getStickerFacingArrow(dims, group.face, group.indices, view)
  return (
    <g opacity={opacity}>
      <polygon
        points={ptsStr(getStickerGroupOutline(dims, group.face, group.indices, view))}
        fill={getStickerColor(state[group.face][group.indices[0]])}
        fillOpacity={0.6}
        stroke={color}
        strokeOpacity={0.6}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <line
        x1={arrowPts.from.x}
        y1={arrowPts.from.y}
        x2={arrowPts.to.x}
        y2={arrowPts.to.y}
        stroke={color}
        strokeOpacity={0.6}
        strokeWidth={2}
        markerEnd="url(#facing-arrowhead)"
      />
    </g>
  )
}

// `animation`: { alg: "R U R' U'", outlineMoves?, loop?, highlightBefore?, highlightAfter?: [{ face, indices }] } plays the
// moves from `state` (once when first scrolled into view, then on Replay, or looping with `loop`).
// `view`: { x, y } camera angles in degrees. `groups`: [{ face, indices }] outlines stickers;
// `labels`: { face: text } names the faces; `pieces`: [[column, row, depth], ...] outlines whole pieces
// (or { at: [column, row, depth], size: [columns, rows, depth] } outlines a block of pieces).
// `highlightColor` (or `animation.highlightColor`) colors the outlines, e.g. to stand out on white stickers.
// `frameBox` fixes the drawing area (used while the camera moves, so the picture doesn't jump).
export default function IsoCube3D({ state, size = 200, animation, view, groups, labels, pieces, highlightColor, frameBox }) {
  const v = view ?? DEFAULT_CUBE_VIEW
  const hl = highlightColor ?? animation?.highlightColor ?? '#FFFFFF'
  // piece counts { x, y, z }; kept stable between redraws so animations don't restart
  const shape = dimsOf(state)
  const dimsKey = `${shape.x}x${shape.y}x${shape.z}`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dims = useMemo(() => shape, [dimsKey])
  const moves = useMemo(() => animation && parseAlg(animation.alg, dims), [animation, dims])
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

  const arrows = useMemo(() => moves?.map(m => getMoveArrow(m, v, dims)) ?? [], [moves, v, dims])
  // each move's letter beside the side that turns
  // `animation.moveLetters: false` leaves them out (a turn with no letter in the notation)
  const letters = useContext(MoveLettersContext) && animation?.moveLetters !== false
  const moveLabels = useMemo(() => (letters && moves ? moves.map(m => getMoveLabelPoint(m, v, dims)) : []), [letters, moves, v, dims])

  const b = getViewBounds(v, dims)
  const box = frameBox ? { ...frameBox } : { minX: b.minX - PAD, minY: b.minY - PAD, maxX: b.maxX + PAD, maxY: b.maxY + PAD }
  for (const a of arrows) growBox(box, a.bounds, ARROW_PAD)
  for (const p of moveLabels) growBox(box, { minX: p.x, maxX: p.x, minY: p.y, maxY: p.y }, 18)
  // visible faces are labeled in place; hidden ones get a label outside the cube with a pointer
  // the move letter names the turning face, so that face's own label is left out
  const labelPoints = labels
    ? Object.entries(labels).filter(([face]) => !(letters && moves?.some(m => m.face === face))).map(([face, text]) => {
      if (isFaceVisible(face, v)) return { text, ...getFaceLabelPoint(face, v, dims) }
      // keep the label away from the head of the first turn arrow
      const side = arrows[0] && (arrows[0].end.x > 0 ? 'left' : 'right')
      const h = getHiddenFaceLabel(face, v, side, dims)
      return { text, ...h.text, pointer: { from: h.from, to: h.to } }
    })
    : []
  for (const p of labelPoints) growBox(box, { minX: p.x, maxX: p.x, minY: p.y, maxY: p.y }, 16)
  for (const g of [...(groups ?? []), ...(animation?.highlightBefore ?? []), ...(animation?.pause?.highlight ?? [])]) {
    if (isFaceVisible(g.face, v)) continue
    const { to } = getStickerFacingArrow(dims, g.face, g.indices, v)
    growBox(box, { minX: to.x, maxX: to.x, minY: to.y, maxY: to.y }, 10)
  }

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
  // the arrow shows only before the turn (fading with the outline), never during it
  const arrowOpacity = frame.spin ? 0 : animation?.outlineMoves ? frame.outline : 1
  const moveLabel = currentMove && moveLabels[frame.k]

  const svg = (
    <svg viewBox={viewBoxOf(box)} width={size} height={size} className="block">
      <g style={{ opacity: frame.opacity }}>
        <Polygons polys={polys} strokeWidth={1.5} />
        {currentMove && frame.outline > 0 && (
          <g opacity={frame.outline}>
            <BoxEdges edges={getMoveOutlineEdges(dims, currentMove, v)} />
          </g>
        )}
        {animation?.highlightBefore && frame.before > 0 && animation.highlightBefore.filter(g => isFaceVisible(g.face, v)).map((g, i) => (
          <polygon
            key={`before-${i}`}
            className={animation.flash ? 'highlight-pulse' : undefined}
            points={ptsStr(getStickerGroupOutline(dims, g.face, g.indices, v))}
            fill={hl}
            fillOpacity={0.15}
            stroke={hl}
            strokeWidth={2.5}
            strokeLinejoin="round"
            style={glow}
          />
        ))}
        {/* arrows from sticker to sticker, before the first move: where each piece is about to go */}
        {animation?.arrows && frame.before > 0 && animation.arrows.map((ar, i) => {
          const center = (g) => {
            const pts = getStickerGroupOutline(dims, g.face, g.indices, v)
            return { x: pts.reduce((a, p) => a + p.x, 0) / pts.length, y: pts.reduce((a, p) => a + p.y, 0) / pts.length }
          }
          const a = center(ar.from), b = center(ar.to)
          const trim = (t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
          const p = trim(0.15), q = trim(0.8)
          return (
            <line key={`cycle-${i}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={ARROW_DARK} strokeWidth={2} strokeLinecap="round" markerEnd="url(#cycle-arrowhead)" style={glow} />
          )
        })}
        {animation?.arrows && (
          <defs>
            <marker id="cycle-arrowhead" markerWidth="5" markerHeight="5" refX="2" refY="2.5" orient="auto">
              <polygon points="0,0 5,2.5 0,5" fill={ARROW_DARK} />
            </marker>
          </defs>
        )}
        {/* the highlight shown while the animation stops part-way through */}
        {animation?.pause && frame.pause > 0 && animation.pause.highlight.map((g, i) => (isFaceVisible(g.face, v)
          ? (
            <polygon
              key={`pause-${i}`}
              points={ptsStr(getStickerGroupOutline(dims, g.face, g.indices, v))}
              fill={hl}
              fillOpacity={0.15}
              stroke={hl}
              strokeWidth={2.5}
              strokeLinejoin="round"
              opacity={frame.pause}
              style={glow}
            />
          )
          : <Ghost key={`pause-${i}`} dims={dims} group={g} view={v} state={states[frame.k]} color={hl} opacity={frame.pause} />
        ))}
        {/* before-highlights on hidden faces flash faintly through the cube, like ghost groups */}
        {animation?.highlightBefore && frame.before > 0 && animation.highlightBefore.filter(g => !isFaceVisible(g.face, v)).map((g, i) => (
          <Ghost key={`before-ghost-${i}`} dims={dims} group={g} view={v} state={state} color={hl} opacity={frame.before} />
        ))}
        {animation?.highlightAfter && frame.highlight > 0 && animation.highlightAfter.filter(g => isFaceVisible(g.face, v)).map((g, i) => (
          <polygon
            key={i}
            points={ptsStr(getStickerGroupOutline(dims, g.face, g.indices, v))}
            fill={hl}
            fillOpacity={0.15}
            stroke={hl}
            strokeWidth={2.5}
            strokeLinejoin="round"
            opacity={frame.highlight}
            style={glow}
          />
        ))}
      </g>
      {pieces?.map((p, i) => (
        <BoxEdges key={`piece-${i}`} edges={Array.isArray(p) ? getPieceEdges(dims, p, v) : getPieceEdges(dims, p.at, v, p.size)} color={hl} hidden={false} />
      ))}
      {/* stickers on hidden faces show faintly through the cube, with an arrow for the way they face */}
      {groups?.filter(g => !isFaceVisible(g.face, v)).map((g, i) => (
        <Ghost key={`ghost-${i}`} dims={dims} group={g} view={v} state={state} color={hl} />
      ))}
      {[...(groups ?? []), ...(animation?.highlightBefore ?? []), ...(animation?.pause?.highlight ?? [])].some(g => !isFaceVisible(g.face, v)) && (
        <defs>
          <marker id="facing-arrowhead" markerWidth="7" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0,0 7,3 0,6" fill={hl} fillOpacity={0.6} />
          </marker>
        </defs>
      )}
      {groups?.filter(g => isFaceVisible(g.face, v)).map((g, i) => (
        <polygon
          key={i}
          points={ptsStr(getStickerGroupOutline(dims, g.face, g.indices, v))}
          fill="none"
          stroke={hl}
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
      {arrow && arrowOpacity > 0 && (
        <g opacity={arrowOpacity}>
          <OutlinedArrow arrow={arrow} />
        </g>
      )}
      {moveLabel && <MoveLetter at={moveLabel} text={moveName(currentMove)} opacity={frame.opacity} />}
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
