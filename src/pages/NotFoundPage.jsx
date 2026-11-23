import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-text-primary mb-4">404</h1>
      <p className="text-text-secondary mb-6">Page not found</p>
      <Link to="/" className="text-accent hover:underline">
        Back to all puzzles
      </Link>
    </div>
  )
}
