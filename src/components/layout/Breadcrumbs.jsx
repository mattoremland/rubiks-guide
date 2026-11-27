import { Link } from 'react-router-dom'

export default function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-text-muted">/</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-accent transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-text-primary font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
