import { parseMoves } from '../../lib/moveParser'
import MoveBadge from './MoveBadge'

// `inline` draws the chips inside a line of text instead of as their own block.
export default function MoveSequence({ notation, className = '', neutral, inline = false }) {
  const tokens = parseMoves(notation)

  const Tag = inline ? 'span' : 'div'
  return (
    <Tag className={`${inline ? 'inline-flex align-middle mx-0.5' : 'flex'} flex-wrap items-center gap-1.5 ${className}`}>
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
    </Tag>
  )
}
