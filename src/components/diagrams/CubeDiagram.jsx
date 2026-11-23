import IsoCube from './IsoCube'
import IsoPyraminx from './IsoPyraminx'

export default function CubeDiagram({
  puzzleType,
  dimensions,
  state,
  highlights,
  angle = 'UFR',
  size = 200,
  turn,
  outline,
}) {
  if (puzzleType === 'pyraminx') {
    return (
      <div className="flex items-center justify-center">
        <IsoPyraminx state={state} highlights={highlights} size={size} turn={turn} outline={outline} />
      </div>
    )
  }

  const dims = {
    x: dimensions.x || 3,
    y: dimensions.y || 3,
    z: dimensions.z || 3,
  }

  return (
    <div className="flex items-center justify-center">
      <IsoCube
        state={state}
        highlights={highlights}
        dims={dims}
        angle={angle}
        size={size}
      />
    </div>
  )
}
