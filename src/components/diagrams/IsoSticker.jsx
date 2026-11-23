import { getStickerColor, shadedColor } from '../../data/colors'

export default function IsoSticker({ points, color, highlight, shadeFactor = 1.0 }) {
  const baseColor = getStickerColor(color)
  const fill = color === 'X' ? baseColor : shadedColor(baseColor, shadeFactor)
  const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ')

  const highlightClass = highlight === 'flash' ? 'sticker-flash'
    : highlight === 'glow' ? 'sticker-glow'
    : highlight === 'dim' ? 'sticker-dim'
    : highlight === 'highlight' ? 'sticker-highlight'
    : ''

  return (
    <polygon
      points={pointsStr}
      fill={fill}
      stroke="#1a1a2e"
      strokeWidth={1}
      className={highlightClass}
    />
  )
}
