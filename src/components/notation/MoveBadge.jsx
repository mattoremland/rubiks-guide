export default function MoveBadge({ move }) {
  if (move.type === 'repeat') {
    // a repeat count, styled like a chip so it isn't lost among the moves
    return (
      <span
        className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-sm font-bold bg-accent/25 text-accent"
        title={`Do the next group ${move.value} times`}
      >
        {move.value}
      </span>
    )
  }
  if (move.type === 'paren') {
    return <span className="text-text-muted font-mono text-lg">{move.value}</span>
  }

  const textClass = /(^|\s)text-/.test(move.colorClass) ? '' : 'text-white'

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-sm font-medium ${textClass} ${move.colorClass}`}
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
