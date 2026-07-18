import useStore from '../store/useStore'

const STAT_LABELS = {
  // Survival
  max_honor:               { label: 'Maximum Honour', unit: '%', category: 'Survival' },
  honor_resistance:        { label: 'Honour Resistance', unit: '%', category: 'Survival' },
  max_honor_resistance:    { label: 'Maximum Honour Resistance', unit: '%', category: 'Survival' },
  honor_restored:          { label: 'Honour Restored', unit: '%', category: 'Survival' },
  honor_on_boss_kill:      { label: 'Honour on Boss Kill', unit: '', category: 'Survival' },
  honor_on_shrine:         { label: 'Honour on Shrine', unit: '', category: 'Survival' },
  honor_on_key:            { label: 'Honour on Key Pickup', unit: '', category: 'Survival' },
  honor_on_room_complete:  { label: 'Honour per Room', unit: '', category: 'Survival' },
  defences:                { label: 'Defences', unit: '%', category: 'Survival' },
  monsters_reduced_damage: { label: 'Monster Damage Reduction', unit: '%', category: 'Survival' },
  monster_reduced_speed:   { label: 'Monster Speed Reduction', unit: '%', category: 'Survival' },
  slow_resistance:         { label: 'Slow Resistance', unit: '%', category: 'Survival' },
  crit_damage_reduction:   { label: 'Crit Damage Taken Reduction', unit: '%', category: 'Survival' },
  honor_death_cheat:       { label: 'Cheat Death Chance', unit: '%', category: 'Survival' },
  // Combat
  monster_damage_taken:    { label: 'Monster Damage Taken', unit: '%', category: 'Combat' },
  rare_damage_taken:       { label: 'Rare Monster Damage Taken', unit: '%', category: 'Combat' },
  boss_damage_taken:       { label: 'Boss Damage Taken', unit: '%', category: 'Combat' },
  // Trial
  avoid_affliction:        { label: 'Avoid Affliction Chance', unit: '%', category: 'Trial' },
  rooms_revealed:          { label: 'Rooms Revealed', unit: '', category: 'Trial' },
  merchant_prices:         { label: 'Merchant Price Reduction', unit: '%', category: 'Trial' },
  merchant_extra_choice:   { label: 'Extra Merchant Choice', unit: '', category: 'Trial' },
  dodge_roll_distance:     { label: 'Dodge Roll Distance', unit: 'm', category: 'Trial' },
  starting_sacred_water:   { label: 'Starting Sacred Water', unit: '', category: 'Trial' },
  // Rewards
  relic_quantity:          { label: 'Relic Quantity', unit: '%', category: 'Rewards' },
  key_quantity:            { label: 'Key Quantity', unit: '%', category: 'Rewards' },
  key_upgrade_chance:      { label: 'Key Upgrade Chance', unit: '%', category: 'Rewards' },
  extra_key_chance:        { label: 'Extra Key Chance', unit: '%', category: 'Rewards' },
  double_sacred_water_monsters:  { label: 'Double Sacred Water (Monsters)', unit: '%', category: 'Rewards' },
  double_sacred_water_fountains: { label: 'Double Sacred Water (Fountains)', unit: '%', category: 'Rewards' },
  sacred_water_on_room:    { label: 'Sacred Water per Room', unit: '', category: 'Rewards' },
}

const CATEGORIES = ['Survival', 'Combat', 'Trial', 'Rewards']

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
    // Round to 2 decimals — fractional stats (e.g. Dodge Roll distance)
    // otherwise display floating point noise like 0.7000000000000001
    const rounded = Math.round(value * 100) / 100
    byCategory[def.category].push({ label: def.label, value: rounded, unit: def.unit })
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
