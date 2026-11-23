import { getFaceStickers, getFaceDimensions } from '../../lib/isometric'
import { getSticker, getHighlight } from '../../lib/cubeState'
import { FACE_SHADING } from '../../data/colors'
import IsoSticker from './IsoSticker'

export default function IsoFace({ face, state, highlights, dims, scale = 40 }) {
  const { gridW, gridH } = getFaceDimensions(face, dims)
  const stickers = getFaceStickers(face, gridW, gridH, dims)
  const shadeFactor = FACE_SHADING[face] || 1.0

  return (
    <g>
      {stickers.map((s) => (
        <IsoSticker
          key={`${face}-${s.index}`}
          points={s.points}
          color={getSticker(state, face, s.index)}
          highlight={getHighlight(highlights, face, s.index)}
          shadeFactor={shadeFactor}
        />
      ))}
    </g>
  )
}
