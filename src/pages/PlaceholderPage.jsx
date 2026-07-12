export default function PlaceholderPage({ title, tamil, phase }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <span className="text-xs font-medium text-gold-dark bg-gold/10 px-3 py-1 rounded-full mb-4">
        {phase}
      </span>
      <h1 className="font-display text-2xl text-maroon-dark">{title}</h1>
      <p className="text-charcoal/50 font-tamil mt-1">{tamil}</p>
      <p className="text-charcoal/40 text-sm mt-4 max-w-sm">
        Idhu next phase la build pannuvom da. Foundation ready aagiducha, next step ready.
      </p>
    </div>
  )
}
