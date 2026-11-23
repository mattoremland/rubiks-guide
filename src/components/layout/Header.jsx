import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="border-b border-border bg-surface-raised">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-text-primary hover:text-accent transition-colors">
          Cube Guide
        </Link>
        <nav className="flex gap-6 text-sm text-text-secondary">
          <Link to="/" className="hover:text-text-primary transition-colors">
            Puzzles
          </Link>
        </nav>
      </div>
    </header>
  )
}
