import { useState } from 'react'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import './App.css'
import Header from './components/Header'
import InventoryPanel from './components/InventoryPanel'
import AltarGrid from './components/AltarGrid'
import StatsPanel from './components/StatsPanel'
import useStore, { canPlace } from './store/useStore'

export default function App() {
  const [activeRelic, setActiveRelic] = useState(null)
  const [overCell, setOverCell] = useState(null)
  const { altar, inventory, blockedCells, placeRelic } = useStore()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragStart({ active }) {
    const relic = inventory.find(r => r.id === active.id)
    setActiveRelic(relic || null)
  }

  function handleDragOver({ over }) {
    if (!over || !activeRelic) { setOverCell(null); return }
    const match = over.id.match(/^cell-(\d+)-(\d+)$/)
    if (!match) { setOverCell(null); return }
    const col = Number(match[1]), row = Number(match[2])
    const valid = canPlace(activeRelic, col, row, altar, inventory, blockedCells, activeRelic.id)
    setOverCell({ col, row, valid })
  }

  function handleDragEnd({ active, over }) {
    setActiveRelic(null)
    setOverCell(null)
    if (!over || !activeRelic) return
    const match = over.id.match(/^cell-(\d+)-(\d+)$/)
    if (!match) return
    const col = Number(match[1]), row = Number(match[2])
    if (canPlace(activeRelic, col, row, altar, inventory, blockedCells, activeRelic.id)) {
      placeRelic(activeRelic.id, col, row)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="app">
        <Header />
        <div className="main-layout">
          <InventoryPanel />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1rem' }}>
            <AltarGrid activeRelic={activeRelic} overCell={overCell} />
          </div>
          <StatsPanel />
        </div>
      </div>

      <DragOverlay>
        {activeRelic && (
          <div style={{
            background: 'var(--surface-alt)',
            border: `2px solid ${activeRelic.isUnique ? 'var(--accent)' : '#4a90e2'}`,
            borderRadius: 6, padding: '0.5rem 0.75rem',
            color: activeRelic.isUnique ? 'var(--accent)' : 'var(--text)',
            fontSize: '0.85rem', fontWeight: 600,
            pointerEvents: 'none', opacity: 0.9,
          }}>
            {activeRelic.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
