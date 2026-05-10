import { useDraggable } from '@dnd-kit/core'
import useStore from '../store/useStore'

export default function RelicCard({ relic }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: relic.id,
    data: { relic },
  })
  const removeFromInventory = useStore(s => s.removeFromInventory)
  const altar = useStore(s => s.altar)
  const isPlaced = altar.some(p => p.relicId === relic.id)

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        background: isPlaced ? 'var(--surface-alt)' : 'var(--surface)',
        border: `1px solid ${relic.isUnique ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 8,
        padding: '0.6rem 0.8rem',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.4 : 1,
        touchAction: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: relic.isUnique ? 'var(--accent)' : 'var(--text)',
          }}>
            {relic.name}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {relic.width}×{relic.height} · {relic.tier}{isPlaced ? ' · placed' : ''}
          </div>
        </div>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={() => removeFromInventory(relic.id)}
          title="Remove from inventory"
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '0 0.15rem',
          }}
        >×</button>
      </div>

      {relic.isUnique ? (
        <ul style={{ marginTop: '0.4rem', paddingLeft: '1rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {relic.effects.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      ) : (
        <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {relic.mods.map((m, i) => (
            <div key={i}>+{m.value}{m.unit} {m.label}</div>
          ))}
        </div>
      )}
    </div>
  )
}
