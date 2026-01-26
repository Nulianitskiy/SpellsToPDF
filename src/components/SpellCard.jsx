function SpellCard({ spell, spellState, onToggle, onDoubleClick }) {
  const levelText = spell.level === 0 ? 'Заговор' : `${spell.level} уровень`
  
  // spellState: 0 = не подготовлено, 1 = подготовлено, 2 = всегда подготовлено
  const stateClass = spellState === 1 ? 'prepared' : spellState === 2 ? 'always-prepared' : ''
  const isChecked = spellState > 0

  return (
    <div 
      className={`spell-card ${stateClass}`}
      onDoubleClick={onDoubleClick}
    >
      <label className="spell-card-header">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggle}
        />
        <div className="spell-info">
          <span className="spell-name">{spell.name}</span>
          <span className="spell-level">{levelText}</span>
        </div>
      </label>
    </div>
  )
}

export default SpellCard
