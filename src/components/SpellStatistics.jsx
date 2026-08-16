function SpellStatistics({ preparedSpells, spells }) {
  const preparedSpellsData = spells.filter(spell => preparedSpells.get(spell.id) === 1)
  const alwaysPreparedSpellsData = spells.filter(spell => preparedSpells.get(spell.id) === 2)

  const preparedStats = preparedSpellsData.reduce((acc, spell) => {
    const level = spell.level
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {})

  const alwaysPreparedStats = alwaysPreparedSpellsData.reduce((acc, spell) => {
    const level = spell.level
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {})

  const maxLevel = Math.max(...spells.map(s => s.level), 0)
  const allLevels = Array.from({ length: maxLevel + 1 }, (_, i) => i)
  const levelsWithSpells = allLevels.filter(level =>
    (preparedStats[level] || 0) > 0 || (alwaysPreparedStats[level] || 0) > 0
  )

  const cantripPrepared = preparedStats[0] || 0
  const cantripAlways = alwaysPreparedStats[0] || 0
  const cantripTotal = cantripPrepared + cantripAlways
  const slottedPrepared = preparedSpellsData.filter(spell => spell.level > 0).length
  const slottedAlways = alwaysPreparedSpellsData.filter(spell => spell.level > 0).length
  const slottedTotal = slottedPrepared + slottedAlways
  const grandTotal = slottedTotal + cantripTotal

  return (
    <div className="spell-statistics">
      <h3 className="statistics-title">Статистика</h3>
      <div className="statistics-content">
        {grandTotal > 0 ? (
          <>
            {levelsWithSpells.map(level => {
              const preparedCount = preparedStats[level] || 0
              const alwaysPreparedCount = alwaysPreparedStats[level] || 0
              const levelLabel = level === 0 ? 'Заговоры' : `${level} Уровень`
              return (
                <div key={level} className="statistics-row">
                  <span className="statistics-label">{levelLabel}:</span>
                  <span className="statistics-values">
                    <span className="statistics-value statistics-prepared">{preparedCount}</span>
                    <span className="statistics-separator">|</span>
                    <span className="statistics-value statistics-always-prepared">{alwaysPreparedCount}</span>
                  </span>
                </div>
              )
            })}
            <div className="statistics-divider"></div>
            <div className="statistics-row statistics-total">
              <span className="statistics-label">Заговоры:</span>
              <span className="statistics-value">{cantripTotal}</span>
            </div>
            <div className="statistics-row statistics-total">
              <span className="statistics-label">Подготовлено:</span>
              <span className="statistics-value statistics-prepared">{slottedPrepared}</span>
            </div>
            <div className="statistics-row statistics-total statistics-always-prepared-row">
              <span className="statistics-label">Всегда подготовлено:</span>
              <span className="statistics-value statistics-always-prepared">{slottedAlways}</span>
            </div>
            <div className="statistics-row statistics-total">
              <span className="statistics-label">Слотовых:</span>
              <span className="statistics-value">{slottedTotal}</span>
            </div>
            <div className="statistics-row statistics-grand-total">
              <span className="statistics-label">Всего:</span>
              <span className="statistics-value">{grandTotal}</span>
            </div>
          </>
        ) : (
          <div className="statistics-empty">
            <span>Нет выбранных заклинаний</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default SpellStatistics
