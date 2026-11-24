import { useEffect, useMemo, useRef, useState } from 'react'
import IsoCube3D from './IsoCube3D'
import { useFirstVisible, ReplayButton } from './movePlayer'
import { getViewBounds, dimsOf } from '../../lib/cube3d'

const PAD = 14
const REST = 900
const TILT = 2200
const HOLD = 2200
const FADE = 350

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const mix = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: (a.z ?? 0) + ((b.z ?? 0) - (a.z ?? 0)) * t })

// The camera moving from `from` to `to` around a still cube (played once when scrolled into view,
// then on Replay), ending on `groups` outlined; afterwards it fades back to the starting angle.
export default function TiltCube({ state, from, to, groups, highlightColor, size = 180 }) {
  const [t, setT] = useState(0)
  const [phase, setPhase] = useState('rest') // rest | tilt | hold | out | in
  const [opacity, setOpacity] = useState(1)
  const [playCount, setPlayCount] = useState(0)
  const [playing, setPlaying] = useState(false)
  const wrapper = useRef(null)
  const play = () => setPlayCount(c => c + 1)
  useFirstVisible(wrapper, true, play)

  // one drawing area that fits every angle along the way
  const frameBox = useMemo(() => {
    const dims = dimsOf(state)
    const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    for (let k = 0; k <= 20; k++) {
      const b = getViewBounds(mix(from, to, k / 20), dims)
      box.minX = Math.min(box.minX, b.minX - PAD)
      box.minY = Math.min(box.minY, b.minY - PAD)
      box.maxX = Math.max(box.maxX, b.maxX + PAD)
      box.maxY = Math.max(box.maxY, b.maxY + PAD)
    }
    return box
  }, [state, from, to])

  useEffect(() => {
    if (playCount === 0) return
    let raf
    const start = performance.now()
    setPlaying(true)
    const tick = (now) => {
      const e = now - start
      if (e < REST) { setPhase('rest'); setT(0); setOpacity(1) }
      else if (e < REST + TILT) { setPhase('tilt'); setT(easeInOut((e - REST) / TILT)) }
      else if (e < REST + TILT + HOLD) { setPhase('hold'); setT(1) }
      else if (e < REST + TILT + HOLD + FADE) { setPhase('out'); setOpacity(1 - (e - REST - TILT - HOLD) / FADE) }
      else if (e < REST + TILT + HOLD + 2 * FADE) { setPhase('in'); setT(0); setOpacity((e - REST - TILT - HOLD - FADE) / FADE) }
      else { setPhase('rest'); setT(0); setOpacity(1); setPlaying(false); return }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playCount])

  const showGroups = phase === 'hold' || phase === 'out'
  return (
    <div ref={wrapper} className="flex flex-col items-center gap-1">
      <div style={{ opacity }}>
        <IsoCube3D
          state={state}
          size={size}
          view={mix(from, to, t)}
          frameBox={frameBox}
          groups={showGroups ? groups : undefined}
          highlightColor={highlightColor}
        />
      </div>
      <ReplayButton onClick={play} disabled={playing || playCount === 0} />
    </div>
  )
}
