import useStore from '../store/useStore'

const STAT_LABELS = {
  honor_resistance:   { label: 'Honour Resistance', unit: '%',  category: 'Survival' },
  max_honor:          { label: 'Maximum Honour',     unit: '',   category: 'Survival' },
  honor_regen:        { label: 'Honour Regen',       unit: '/s', category: 'Survival' },
  boon_effect:        { label: 'Boon Effect',         unit: '%',  category: 'Trial' },
  affliction_reduction:{ label: 'Affliction Reduction', unit: '%', category: 'Trial' },
  currency_quantity:  { label: 'Currency Quantity',  unit: '%',  category: 'Rewards' },
  unique_rarity:      { label: 'Unique Item Rarity', unit: '%',  category: 'Rewards' },
  boss_damage:        { label: 'Boss Damage',         unit: '%',  category: 'Rewards' },
}

const CATEGORIES = ['Survival', 'Trial', 'Rewards']

const headerStyle = {
  fontSize: '0.7rem', fontWeight: 600,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: 'var(--text-muted)', marginBottom: '0.5rem',
}

export default function StatsPanel() {
  const { altar, inventory } = useStore()

  const placedRelics = altar
    .map(p => inventory.find(r => r.id === p.relicId))
    .filter(Boolean)

  const uniqueRelics = placedRelics.filter(r => r.isUnique)
  const magicRelics = placedRelics.filter(r => !r.isUnique)

  const totals = {}
  for (const relic of magicRelics) {
    for (const mod of relic.mods) {
      totals[mod.stat] = (totals[mod.stat] || 0) + mod.value
    }
  }

  const byCategory = {}
  for (const [stat, value] of Object.entries(totals)) {
    const def = STAT_LABELS[stat]
    if (!def) continue
    if (!byCategory[def.category]) byCategory[def.category] = []
    byCategory[def.category].push({ label: def.label, value, unit: def.unit })
  }

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h2 style={headerStyle}>Altar Stats</h2>

      {placedRelics.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
          Drag relics onto the altar to see aggregated stats.
        </p>
      )}

      {CATEGORIES.map(cat => {
        const stats = byCategory[cat]
        if (!stats?.length) return null
        return (
          <div key={cat}>
            <div style={headerStyle}>{cat}</div>
            {stats.map(s => (
              <div
                key={s.label}
                style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '0.875rem', padding: '0.25rem 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  +{s.value}{s.unit}
                </span>
              </div>
            ))}
          </div>
        )
      })}

      {uniqueRelics.length > 0 && (
        <div>
          <div style={headerStyle}>Unique Effects</div>
          {uniqueRelics.map(r => (
            <div
              key={r.id}
              style={{
                background: 'var(--surface)', border: '1px solid var(--accent)',
                borderRadius: 6, padding: '0.6rem 0.75rem', marginBottom: '0.5rem',
              }}
            >
              <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                {r.name}
              </div>
              {r.effects.map((e, i) => (
                <div key={i} style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{e}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: 'auto', paddingTop: '1rem',
        borderTop: '1px solid var(--border)',
        fontSize: '0.75rem', color: 'var(--text-muted)',
      }}>
        {placedRelics.length} relic{placedRelics.length !== 1 ? 's' : ''} placed
      </div>
    </aside>
  )
}
