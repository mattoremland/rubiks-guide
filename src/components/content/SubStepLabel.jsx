// Small badge naming a sub-step, e.g. "3b". Its id (step-3b) lets other pages link straight to it.
export default function SubStepLabel({ label }) {
  return (
    <span id={`step-${label}`} className="scroll-mt-24 inline-block shrink-0 font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-accent/20 text-accent">
      {label}
    </span>
  )
}
