// Small badge naming a sub-step, e.g. "3b". Its id (step-3b) lets other pages link straight to it;
// copies elsewhere on the page (the quick reference) pass anchor={false} so the id stays unique.
export default function SubStepLabel({ label, anchor = true }) {
  return (
    <span id={anchor ? `step-${label}` : undefined} className="scroll-mt-24 inline-block shrink-0 font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-accent/20 text-accent">
      {label}
    </span>
  )
}
