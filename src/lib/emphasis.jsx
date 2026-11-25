import { Link } from 'react-router-dom'

const em = (text, key) => text.split(/\*([^*]+)\*/).map((part, i) => (i % 2 ? <em key={`${key}-${i}`}>{part}</em> : part))

// Renders *word* as emphasized text and [words](/path#anchor) as a link within the site.
export function withEmphasis(text) {
  return text.split(/\[([^\]]+)\]\(([^)]+)\)/).flatMap((part, i, all) => {
    if (i % 3 === 1) return [<Link key={i} to={all[i + 1]} className="text-accent hover:underline">{part}</Link>]
    if (i % 3 === 2) return []
    return em(part, i)
  })
}
