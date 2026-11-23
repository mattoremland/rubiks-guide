import IsoCube from './IsoCube'
import IsoPyraminx from './IsoPyraminx'
import IsoCube3D from './IsoCube3D'

export default function CubeDiagram({
  puzzleType,
  dimensions,
  state,
  highlights,
  angle = 'UFR',
  size = 200,
  animation,
  view,
  outline,
  bottomBand,
  groups,
  labels,
}) {
  if (puzzleType === 'pyraminx') {
    return (
      <div className="flex items-center justify-center">
        <IsoPyraminx
          state={state}
          highlights={highlights}
          size={size}
          animation={animation}
          view={view}
          outline={outline}
          bottomBand={bottomBand}
          groups={groups}
          labels={labels}
        />
      </div>
    )
  }

  if (puzzleType === 'cube') {
    return (
      <div className="flex items-center justify-center">
        <IsoCube3D state={state} size={size} animation={animation} view={view} groups={groups} labels={labels} />
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
