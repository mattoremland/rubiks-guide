import { parseMoves } from '../../lib/moveParser'
import MoveBadge from './MoveBadge'

function groupTokens(tokens) {
  const groups = []
  let current = []
  let inParen = false
  for (const token of tokens) {
    if (token.type === 'paren' && token.value === '(') {
      if (current.length) groups.push({ wrap: true, tokens: current })
      current = [token]
      inParen = true
    } else if (token.type === 'paren' && token.value === ')') {
      current.push(token)
      groups.push({ wrap: false, tokens: current })
      current = []
      inParen = false
    } else if (token.type === 'repeat' && !inParen) {
      current.push(token)
    } else {
      current.push(token)
    }
  }
  if (current.length) groups.push({ wrap: true, tokens: current })
  return groups
}

// `inline` draws the chips inside a line of text instead of as their own block.
export default function MoveSequence({ notation, className = '', neutral, inline = false }) {
  const tokens = parseMoves(notation)
  const groups = groupTokens(tokens)

  const Tag = inline ? 'span' : 'div'
  return (
    <Tag className={`${inline ? 'inline-flex align-middle mx-0.5' : 'flex'} flex-wrap items-center gap-1.5 ${className}`}>
      {groups.map((group, gi) =>
        group.wrap ? (
          group.tokens.map((token, ti) => (
            <MoveBadge
              key={`${gi}-${ti}`}
              move={neutral && token.type === 'move' ? { ...token, colorClass: 'bg-white text-gray-900' } : token}
            />
          ))
        ) : (
          <span key={gi} className="inline-flex items-center gap-1.5 flex-nowrap">
            {group.tokens.map((token, ti) => (
              <MoveBadge
                key={ti}
                move={neutral && token.type === 'move' ? { ...token, colorClass: 'bg-white text-gray-900' } : token}
              />
            ))}
          </span>
        )
      )}
    </Tag>
  )
}
