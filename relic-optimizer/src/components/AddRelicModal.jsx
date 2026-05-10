import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import relicsData from '../data/relics.json'
import useStore from '../store/useStore'

const selectStyle = {
  width: '100%',
  padding: '0.5rem',
  background: 'var(--surface-alt)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--text)',
  fontSize: '0.9rem',
}

const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  marginBottom: 4,
}

export default function AddRelicModal({ onClose }) {
  const addToInventory = useStore(s => s.addToInventory)
  const [rarity, setRarity] = useState('magic')
  const [baseId, setBaseId] = useState(relicsData.baseTiers[0].id)
  const [uniqueId, setUniqueId] = useState(relicsData.uniqueRelics[0].id)
  const [mods, setMods] = useState([{ modId: '', value: '' }])

  const selectedBase = relicsData.baseTiers.find(b => b.id === baseId)
  const modsForTier = relicsData.modifierPool[selectedBase?.tier || 'small']

  function addMod() {
    if (mods.length < 2) setMods([...mods, { modId: '', value: '' }])
  }

  function updateMod(i, field, val) {
    const next = [...mods]
    next[i] = { ...next[i], [field]: val }
    setMods(next)
  }

  function removeMod(i) {
    setMods(mods.filter((_, idx) => idx !== i))
  }

  function handleBaseChange(newBaseId) {
    setBaseId(newBaseId)
    setMods([{ modId: '', value: '' }])
  }

  function handleAdd() {
    if (rarity === 'unique') {
      const unique = relicsData.uniqueRelics.find(u => u.id === uniqueId)
      const base = relicsData.baseTiers.find(b => b.id === unique.baseId)
      addToInventory({
        id: uuid(),
        name: unique.name,
        rarity: 'unique',
        isUnique: true,
        uniqueId: unique.id,
        baseId: unique.baseId,
        width: unique.width,
        height: unique.height,
        tier: base?.tier || 'large',
        effects: unique.effects,
        mods: [],
      })
    } else {
      const base = relicsData.baseTiers.find(b => b.id === baseId)
      const resolvedMods = mods
        .filter(m => m.modId && m.value !== '')
        .map(m => {
          const def = modsForTier.find(md => md.id === m.modId)
          return { stat: def.stat, label: def.label, value: Number(m.value), unit: def.unit }
        })
      addToInventory({
        id: uuid(),
        name: base.name,
        rarity: 'magic',
        isUnique: false,
        baseId: base.id,
        width: base.width,
        height: base.height,
        tier: base.tier,
        mods: resolvedMods,
        effects: [],
      })
    }
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '1.5rem',
          width: 360,
          maxWidth: '95vw',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ color: 'var(--accent)', fontSize: '1rem', fontWeight: 700 }}>
          Add Relic to Inventory
        </h2>

        {/* Rarity toggle */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['magic', 'unique'].map(r => (
            <button
              key={r}
              onClick={() => setRarity(r)}
              style={{
                flex: 1, padding: '0.4rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem',
                background: rarity === r ? 'var(--accent)' : 'var(--surface-alt)',
                color: rarity === r ? '#0f1117' : 'var(--text)',
                border: `1px solid ${rarity === r ? 'var(--accent)' : 'var(--border)'}`,
                fontWeight: rarity === r ? 700 : 400,
              }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {rarity === 'magic' ? (
          <>
            <div>
              <label style={labelStyle}>Base Type</label>
              <select
                style={selectStyle}
                value={baseId}
                onChange={e => handleBaseChange(e.target.value)}
              >
                {relicsData.baseTiers.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.width}×{b.height})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Modifiers (up to 2)</label>
              {mods.map((mod, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <select
                    style={{ ...selectStyle, flex: 1 }}
                    value={mod.modId}
                    onChange={e => updateMod(i, 'modId', e.target.value)}
                  >
                    <option value="">— pick mod —</option>
                    {modsForTier.map(m => (
                      <option key={m.id} value={m.id}>{m.label} ({m.min}–{m.max})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="val"
                    value={mod.value}
                    onChange={e => updateMod(i, 'value', e.target.value)}
                    style={{
                      width: 70, padding: '0.5rem',
                      background: 'var(--surface-alt)', border: '1px solid var(--border)',
                      borderRadius: 6, color: 'var(--text)', fontSize: '0.9rem',
                    }}
                  />
                  <button
                    onClick={() => removeMod(i)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
                  >×</button>
                </div>
              ))}
              {mods.length < 2 && (
                <button
                  onClick={addMod}
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  + Add modifier
                </button>
              )}
            </div>
          </>
        ) : (
          <div>
            <label style={labelStyle}>Unique Relic</label>
            <select style={selectStyle} value={uniqueId} onChange={e => setUniqueId(e.target.value)}>
              {relicsData.uniqueRelics.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem', background: 'none', border: '1px solid var(--border)',
              borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            style={{
              padding: '0.5rem 1.25rem', background: 'var(--accent)', border: 'none',
              borderRadius: 6, color: '#0f1117', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
