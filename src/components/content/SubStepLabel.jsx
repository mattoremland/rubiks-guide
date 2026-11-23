// Small badge naming a sub-step, e.g. "3b".
export default function SubStepLabel({ label }) {
  return (
    <span className="inline-block shrink-0 font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-accent/20 text-accent">
      {label}
    </span>
  )
}
