import IsoCube from './IsoCube'

export default function CubeDiagram({
  puzzleType,
  dimensions,
  state,
  highlights,
  angle = 'UFR',
  size = 200,
}) {
  if (puzzleType === 'pyraminx') {
    return (
      <div className="flex items-center justify-center p-4 text-text-muted text-sm italic">
        Pyraminx diagram coming soon
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
