import { Link } from 'react-router-dom'
import MoveSequence from '../components/notation/MoveSequence'

const em = (text, key) => text.split(/\*([^*]+)\*/).map((part, i) => (i % 2 ? <em key={`${key}-${i}`}>{part}</em> : part))
// `R U R'` in backticks becomes colored move chips
const moves = (text, key) => text.split(/`([^`]+)`/).flatMap((part, i) =>
  i % 2 ? [<MoveSequence key={`${key}-m${i}`} notation={part} inline />] : em(part, `${key}-${i}`))

// Renders *word* as emphasized text, `moves` as move chips and [words](/path#anchor) as a link
// within the site.
export function withEmphasis(text) {
  return text.split(/\[([^\]]+)\]\(([^)]+)\)/).flatMap((part, i, all) => {
    if (i % 3 === 1) return [<Link key={i} to={all[i + 1]} className="text-accent hover:underline">{part}</Link>]
    if (i % 3 === 2) return []
    return moves(part, i)
  })
}
