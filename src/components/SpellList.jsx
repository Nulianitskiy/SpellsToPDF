import { useState } from 'react'
import { createPortal } from 'react-dom'
import SpellCard from './SpellCard'
import SpellDetailsModal from './SpellDetailsModal'
import useFinePointer from '../hooks/useFinePointer'

function SpellList({ spells, preparedSpells, cycleSpell, toggleSpell, toggleAlwaysPrepared }) {
  const finePointer = useFinePointer()
  // ID заклинания с закреплённым попапом (не более одного одновременно)
  const [pinnedSpellId, setPinnedSpellId] = useState(null)
  const [detailsSpell, setDetailsSpell] = useState(null)

  const handleNavigate = (event) => {
    const cards = event.currentTarget.closest('.spell-list')?.querySelectorAll('.spell-card')
    if (!cards?.length) return

    const current = Array.from(cards).indexOf(event.currentTarget)
    if (current < 0) return

    let next = current
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = Math.min(cards.length - 1, current + 1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = Math.max(0, current - 1)
    }
    if (next === current) return

    event.preventDefault()
    cards[next].focus()
  }

  if (spells.length === 0 && !detailsSpell) {
    return (
      <div className="spell-list-empty">
        <p>Заклинания не найдены</p>
      </div>
    )
  }

  // Group spells by level
  const groupedSpells = spells.reduce((groups, spell) => {
    const level = spell.level
    if (!groups[level]) {
      groups[level] = []
    }
    groups[level].push(spell)
    return groups
  }, {})

  const sortedLevels = Object.keys(groupedSpells).map(Number).sort((a, b) => a - b)

  return (
    <div className="spell-list">
      {spells.length === 0 ? (
        <div className="spell-list-empty">
          <p>Заклинания не найдены</p>
        </div>
      ) : (
        sortedLevels.map(level => (
          <div key={level} className="spell-level-group">
            <h2 className="level-header">
              {level === 0 ? 'Заговоры' : `${level} уровень`}
            </h2>
            <div className="spells-grid">
              {groupedSpells[level].map(spell => (
                <SpellCard
                  key={spell.id}
                  spell={spell}
                  spellState={preparedSpells.get(spell.id) || 0}
                  onCycle={() => cycleSpell(spell.id)}
                  onOpenDetails={finePointer ? undefined : () => {
                    setPinnedSpellId(null)
                    setDetailsSpell(spell)
                  }}
                  hoverEnabled={finePointer}
                  pinnedSpellId={pinnedSpellId}
                  onPin={setPinnedSpellId}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {detailsSpell && createPortal(
        <SpellDetailsModal
          spell={detailsSpell}
          spellState={preparedSpells.get(detailsSpell.id) || 0}
          onClose={() => setDetailsSpell(null)}
          onToggle={() => toggleSpell(detailsSpell.id)}
          onAlwaysPrepared={() => toggleAlwaysPrepared(detailsSpell.id)}
        />,
        document.body
      )}
    </div>
  )
}

export default SpellList
