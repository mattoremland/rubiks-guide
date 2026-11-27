import { Outlet, Link } from 'react-router-dom'
import Header from './Header'

export default function Layout() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-text-muted">
          <span>&copy; 2026 Tidal Wave Games</span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-text-primary transition-colors">All Puzzles</Link>
            <a href="https://tidalwavegames.net" className="hover:text-text-primary transition-colors">tidalwavegames.net</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
