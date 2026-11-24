import IsoCube from './IsoCube'
import IsoPyraminx from './IsoPyraminx'
import IsoCube3D from './IsoCube3D'
import TiltCube from './TiltCube'
import { DEFAULT_CUBE_VIEW } from '../../lib/cube3d'

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
  pieces,
  highlightColor,
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

  if ((puzzleType === 'cube' || puzzleType === 'cuboid') && animation?.tilt) {
    // the camera moves (animation.tilt is the angle it ends on); the cube itself doesn't turn
    return (
      <div className="flex items-center justify-center">
        <TiltCube
          state={state}
          from={view ?? DEFAULT_CUBE_VIEW}
          to={animation.tilt}
          groups={animation.highlightAfter}
          highlightColor={highlightColor ?? animation.highlightColor}
          size={size}
        />
      </div>
    )
  }

  if (puzzleType === 'cube' || puzzleType === 'cuboid') {
    return (
      <div className="flex items-center justify-center">
        <IsoCube3D state={state} size={size} animation={animation} view={view} groups={groups} labels={labels} pieces={pieces} highlightColor={highlightColor} />
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
