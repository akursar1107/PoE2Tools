import { useState } from 'react'
import useStore from '../store/useStore'

const STATS = [
  { key: 'max_honor',               label: 'Maximum Honour' },
  { key: 'honor_resistance',        label: 'Honour Resistance' },
  { key: 'honor_restored',          label: 'Honour Restored' },
  { key: 'honor_on_boss_kill',      label: 'Honour on Boss Kill' },
  { key: 'monsters_reduced_damage', label: 'Monster Damage Reduction' },
  { key: 'monster_damage_taken',    label: 'Monster Damage Taken' },
  { key: 'boss_damage_taken',       label: 'Boss Damage Taken' },
  { key: 'relic_quantity',          label: 'Relic Quantity' },
  { key: 'key_quantity',            label: 'Key Quantity' },
  { key: 'avoid_affliction',        label: 'Avoid Affliction Chance' },
  { key: 'rooms_revealed',          label: 'Rooms Revealed' },
]

export default function OptimizePanel() {
  const optimizeForStat = useStore(s => s.optimizeForStat)
  const lastOptimizePlaced = useStore(s => s.lastOptimizePlaced)
  const inventory = useStore(s => s.inventory)
  const [selectedStat, setSelectedStat] = useState(STATS[0].key)
  const [ran, setRan] = useState(false)

  function handleOptimize() {
    optimizeForStat(selectedStat)
    setRan(true)
  }

  const candidateCount = inventory.filter(r =>
    r.mods?.some(m => m.stat === selectedStat)
  ).length

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <h2 style={{
        fontSize: '0.75rem', fontWeight: 600,
        letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)',
        margin: 0,
      }}>
        Auto-Optimize
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Maximize stat
        </label>
        <select
          value={selectedStat}
          onChange={e => { setSelectedStat(e.target.value); setRan(false) }}
          style={{
            padding: '0.45rem 0.5rem',
            background: 'var(--surface-alt)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text)',
            fontSize: '0.85rem',
            width: '100%',
          }}
        >
          {STATS.map(s => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
          {candidateCount} relic{candidateCount !== 1 ? 's' : ''} in inventory with this stat
        </p>
      </div>

      <button
        onClick={handleOptimize}
        disabled={candidateCount === 0}
        style={{
          padding: '0.5rem',
          background: candidateCount > 0 ? 'var(--accent)' : 'var(--surface-alt)',
          border: 'none',
          borderRadius: 6,
          color: candidateCount > 0 ? '#0f1117' : 'var(--text-muted)',
          fontWeight: 700,
          cursor: candidateCount > 0 ? 'pointer' : 'default',
          fontSize: '0.9rem',
        }}
      >
        ⚡ Optimize
      </button>

      {ran && (
        <p style={{
          fontSize: '0.8rem', margin: 0, textAlign: 'center',
          color: lastOptimizePlaced > 0 ? 'var(--accent)' : 'var(--text-muted)',
        }}>
          {lastOptimizePlaced > 0
            ? `✓ Placed ${lastOptimizePlaced} relic${lastOptimizePlaced !== 1 ? 's' : ''}`
            : 'No relics could be placed — altar may be full'}
        </p>
      )}
    </div>
  )
}
