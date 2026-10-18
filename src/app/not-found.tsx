import TransitionLink from '@/components/TransitionLink'

export default function NotFound() {
  return (
    <main
      id="main"
      style={{
        minHeight: '100svh',
        display: 'grid',
        alignContent: 'center',
        gap: 28,
        padding: 'calc(var(--nav-h) + 40px) var(--gutter) 80px',
      }}
    >
      <span className="mono muted">(404) — Out of distribution</span>
      <h1 style={{ fontSize: 'clamp(64px, 14vw, 260px)', fontWeight: 500, lineHeight: 0.85, letterSpacing: '-0.06em' }}>
        The model
        <br />
        <em style={{ color: 'var(--lilac)' }}>hallucinated</em> this.
      </h1>
      <p style={{ maxWidth: '38ch', fontSize: 20, color: 'var(--paper-2)' }}>
        This page doesn&apos;t exist — but plenty of real work does.
      </p>
      <div>
        <TransitionLink href="/" className="btn btn--violet">
          <span className="roll">
            <span data-text="Back home">Back home</span>
          </span>
          <span aria-hidden="true">→</span>
        </TransitionLink>
      </div>
    </main>
  )
}
