export default function MoveBadge({ move }) {
  if (move.type === 'paren') {
    return <span className="text-text-muted font-mono text-lg">{move.value}</span>
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-sm font-medium text-white ${move.colorClass}`}
      title={`${move.face} face${move.modifier === "'" ? ', counterclockwise' : move.modifier === '2' ? ', 180°' : ', clockwise'}`}
    >
      {move.base}
      {move.modifier && (
        <span className="text-xs ml-0.5 opacity-80">
          {move.modifier}
        </span>
      )}
    </span>
  )
}
