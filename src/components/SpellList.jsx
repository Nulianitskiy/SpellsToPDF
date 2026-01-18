import SpellCard from './SpellCard'

function SpellList({ spells, preparedSpells, toggleSpell }) {
  if (spells.length === 0) {
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
      {sortedLevels.map(level => (
        <div key={level} className="spell-level-group">
          <h2 className="level-header">
            {level === 0 ? 'Заговоры' : `${level} уровень`}
          </h2>
          <div className="spells-grid">
            {groupedSpells[level].map(spell => (
              <SpellCard
                key={spell.id}
                spell={spell}
                isPrepared={preparedSpells.has(spell.id)}
                onToggle={() => toggleSpell(spell.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SpellList
