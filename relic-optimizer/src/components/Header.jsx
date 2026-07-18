export default function Header() {
  return (
    <header style={{
      padding: '1rem 1.5rem',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div>
        <h1 style={{ color: 'var(--accent)', fontSize: '1.3rem', fontWeight: 700 }}>
          Sekhemas Relic Planner
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.1rem' }}>
          Trial of the Sekhemas altar optimizer · Path of Exile 2
        </p>
      </div>
      <a
        href="../"
        style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}
      >
        ← All Tools
      </a>
    </header>
  )
}
