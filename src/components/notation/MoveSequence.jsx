import { parseMoves } from '../../lib/moveParser'
import MoveBadge from './MoveBadge'

export default function MoveSequence({ notation, className = '', neutral }) {
  const tokens = parseMoves(notation)

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {tokens.map((token, i) => (
        <MoveBadge
          key={i}
          move={
            neutral && token.type === 'move'
              ? { ...token, colorClass: 'bg-white text-gray-900' }
              : token
          }
        />
      ))}
    </div>
  )
}
