import { puzzles } from '../data/puzzles'
import PuzzleCard from '../components/content/PuzzleCard'

export default function HomePage() {
  return (
    <div>
      <a
        href="https://tidalwavegames.net"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <span aria-hidden="true">&larr;</span> tidalwavegames.net
      </a>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-text-primary">Rubik's Cube Guides</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {puzzles.map((puzzle) => (
          <PuzzleCard key={puzzle.slug} puzzle={puzzle} />
        ))}
      </div>
    </div>
  )
}
