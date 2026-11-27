const LABELS = ['', 'Easy', 'Easy', 'Medium', 'Medium', 'Hard', 'Expert']
// easy green, medium yellow, hard red
const COLORS = {
  Easy: 'bg-green-500/20 text-green-400',
  Medium: 'bg-yellow-400/20 text-yellow-300',
  Hard: 'bg-red-500/20 text-red-400',
}

// A puzzle's difficulty (1-6 in puzzles.js) as a small colored tag.
export default function DifficultyBadge({ difficulty, className = '' }) {
  const label = LABELS[difficulty] || 'Medium'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${COLORS[label] ?? 'bg-accent/20 text-accent'} ${className}`}>
      {label}
    </span>
  )
}
