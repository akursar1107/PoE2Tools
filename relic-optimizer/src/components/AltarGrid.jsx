import { useDroppable } from '@dnd-kit/core'
import useStore from '../store/useStore'
import { COLS, ROWS } from '../utils/altarLogic'

function GridCell({ col, row, isBlocked, highlight }) {
  const { setNodeRef, isOver } = useDroppable({ id: `cell-${col}-${row}`, disabled: isBlocked })

  let bg = 'var(--surface)'
  if (isBlocked) bg = '#0a0c12'
  else if (isOver && highlight === 'valid') bg = 'rgba(39,174,96,0.3)'
  else if (isOver && highlight === 'invalid') bg = 'rgba(192,57,43,0.3)'

  return (
    <div
      ref={setNodeRef}
      style={{
        width: 'var(--cell-size)',
        height: 'var(--cell-size)',
        background: bg,
        border: `1px solid ${isBlocked ? '#16191f' : 'var(--border)'}`,
        borderRadius: 4,
        transition: 'background 0.1s',
      }}
    />
  )
}

export default function AltarGrid({ activeRelic, overCell }) {
  const { altar, inventory, blockedCells, removeFromAltar, clearAltar } = useStore()

  function isBlocked(col, row) {
    return blockedCells.some(b => b.col === col && b.row === row)
  }

  function getCellHighlight(col, row) {
    if (!activeRelic || !overCell) return null
    if (overCell.col !== col || overCell.row !== row) return null
    return overCell.valid ? 'valid' : 'invalid'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, var(--cell-size))`,
          gridTemplateRows: `repeat(${ROWS}, var(--cell-size))`,
          gap: 4,
          position: 'relative',
        }}
      >
        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: COLS }, (_, col) => (
            <GridCell
              key={`${col}-${row}`}
              col={col}
              row={row}
              isBlocked={isBlocked(col, row)}
              highlight={getCellHighlight(col, row)}
            />
          ))
        )}

        {altar.map(({ relicId, col, row }) => {
          const relic = inventory.find(r => r.id === relicId)
          if (!relic) return null
          return (
            <div
              key={relicId}
              onDoubleClick={() => removeFromAltar(relicId)}
              title={`${relic.name} — double-click to remove`}
              style={{
                position: 'absolute',
                left: `calc(${col} * (var(--cell-size) + 4px))`,
                top: `calc(${row} * (var(--cell-size) + 4px))`,
                width: `calc(${relic.width} * var(--cell-size) + ${(relic.width - 1) * 4}px)`,
                height: `calc(${relic.height} * var(--cell-size) + ${(relic.height - 1) * 4}px)`,
                background: relic.isUnique ? 'rgba(200,155,60,0.2)' : 'rgba(74,144,226,0.15)',
                border: `2px solid ${relic.isUnique ? 'var(--accent)' : '#4a90e2'}`,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: relic.isUnique ? 'var(--accent)' : 'var(--text)',
                padding: '0.25rem',
                textAlign: 'center',
                overflow: 'hidden',
                pointerEvents: 'all',
                userSelect: 'none',
              }}
            >
              {relic.name}
            </div>
          )
        })}
      </div>

      <button
        onClick={clearAltar}
        style={{
          padding: '0.4rem 1.25rem',
          background: 'none',
          border: '1px solid var(--border)',
          borderRadius: 6,
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '0.85rem',
          transition: 'border-color 0.15s',
        }}
        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--text-muted)'}
        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        Clear Altar
      </button>
    </div>
  )
}
