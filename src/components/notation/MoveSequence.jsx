import { parseMoves } from '../../lib/moveParser'
import MoveBadge from './MoveBadge'

export default function MoveSequence({ notation, className = '' }) {
  const tokens = parseMoves(notation)

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {tokens.map((token, i) => (
        <MoveBadge key={i} move={token} />
      ))}
    </div>
  )
}
