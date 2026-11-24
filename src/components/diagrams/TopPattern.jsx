import { getStickerColor } from '../../data/colors'

const CELL = 22
const GAP = 3
const STRIP = 7
const OFF = STRIP + GAP + 2

// A bird's-eye view of the top face showing only where the top color is: the nine top stickers
// plus the top row of each side as thin strips. `pattern` says, for each top corner (BL, BR, FL, FR),
// which way its top-color sticker faces: 'U' (up), or the side 'F', 'B', 'L' or 'R'. The edges and
// center always show the top color. `color` is the top color's sticker code.
export default function TopPattern({ pattern, color = 'G', circled = false, size = 96 }) {
  const on = getStickerColor(color)
  const off = '#374151'
  const span = 3 * CELL + 2 * GAP
  const total = span + 2 * OFF
  const fillTop = (r, c) => {
    const corner = { '0,0': 'BL', '0,2': 'BR', '2,0': 'FL', '2,2': 'FR' }[`${r},${c}`]
    return !corner || pattern[corner] === 'U' ? on : off
  }
  const x = (c) => OFF + c * (CELL + GAP)
  // side strips: [corner whose sticker it is, the side it faces] for the end cells; the middle cell is an edge
  const strips = [
    { side: 'B', cells: ['BL', null, 'BR'], at: (i) => ({ x: x(i), y: OFF - GAP - STRIP, w: CELL, h: STRIP }) },
    { side: 'F', cells: ['FL', null, 'FR'], at: (i) => ({ x: x(i), y: OFF + span + GAP, w: CELL, h: STRIP }) },
    { side: 'L', cells: ['BL', null, 'FL'], at: (i) => ({ x: OFF - GAP - STRIP, y: x(i), w: STRIP, h: CELL }) },
    { side: 'R', cells: ['BR', null, 'FR'], at: (i) => ({ x: OFF + span + GAP, y: x(i), w: STRIP, h: CELL }) },
  ]
  return (
    <svg viewBox={`-4 -4 ${total + 8} ${total + 8}`} width={size} height={size} className="block">
      {circled && <rect x={-2} y={-2} width={total + 4} height={total + 4} rx={10} fill="none" stroke="#FFFFFF" strokeWidth={2.5} />}
      {[0, 1, 2].flatMap(r => [0, 1, 2].map(c => (
        <rect key={`${r}${c}`} x={x(c)} y={x(r)} width={CELL} height={CELL} rx={3} fill={fillTop(r, c)} stroke="#1a1a2e" strokeWidth={1} />
      )))}
      {strips.flatMap(s => s.cells.map((corner, i) => {
        const b = s.at(i)
        const lit = corner && pattern[corner] === s.side
        return <rect key={`${s.side}${i}`} x={b.x} y={b.y} width={b.w} height={b.h} rx={2} fill={lit ? on : off} stroke="#1a1a2e" strokeWidth={1} />
      }))}
    </svg>
  )
}
