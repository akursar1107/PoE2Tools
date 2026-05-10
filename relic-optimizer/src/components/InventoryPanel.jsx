import { useState } from 'react'
import useStore from '../store/useStore'
import RelicCard from './RelicCard'
import AddRelicModal from './AddRelicModal'

export default function InventoryPanel() {
  const inventory = useStore(s => s.inventory)
  const [showModal, setShowModal] = useState(false)

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{
          fontSize: '0.75rem', fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)',
        }}>
          Inventory ({inventory.length})
        </h2>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '0.3rem 0.75rem', background: 'var(--accent)', border: 'none',
            borderRadius: 6, color: '#0f1117', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem',
          }}
        >
          + Add
        </button>
      </div>

      {inventory.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
          No relics yet. Click <strong style={{ color: 'var(--accent)' }}>+ Add</strong> to add your first relic.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', maxHeight: '70vh' }}>
        {inventory.map(relic => (
          <RelicCard key={relic.id} relic={relic} />
        ))}
      </div>

      {showModal && <AddRelicModal onClose={() => setShowModal(false)} />}
    </aside>
  )
}
