import { getVisibleFaces } from '../../lib/isometric'
import IsoFace from './IsoFace'

export default function IsoCube({ state, highlights, dims, angle = 'UFR', size = 200 }) {
  const faces = getVisibleFaces(angle)
  const maxDim = Math.max(dims.x, dims.y, dims.z)
  const pad = 20
  const viewSize = maxDim * 40 * 2 + pad * 2

  return (
    <svg
      viewBox={`${-viewSize / 2} ${-viewSize / 2} ${viewSize} ${viewSize}`}
      width={size}
      height={size}
      className="block"
    >
      {faces.map((face) => (
        <IsoFace
          key={face}
          face={face}
          state={state}
          highlights={highlights}
          dims={dims}
        />
      ))}
    </svg>
  )
}
