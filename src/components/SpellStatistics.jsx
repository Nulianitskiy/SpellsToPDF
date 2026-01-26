function SpellStatistics({ preparedSpells, spells }) {
  // Получаем данные подготовленных заклинаний (состояние 1)
  const preparedSpellsData = spells.filter(spell => preparedSpells.get(spell.id) === 1)
  
  // Получаем данные всегда подготовленных заклинаний (состояние 2)
  const alwaysPreparedSpellsData = spells.filter(spell => preparedSpells.get(spell.id) === 2)
  
  // Подсчитываем статистику по уровням для подготовленных
  const preparedStats = preparedSpellsData.reduce((acc, spell) => {
    const level = spell.level
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {})
  
  // Подсчитываем статистику по уровням для всегда подготовленных
  const alwaysPreparedStats = alwaysPreparedSpellsData.reduce((acc, spell) => {
    const level = spell.level
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {})
  
  // Получаем максимальный уровень из всех заклинаний
  const maxLevel = Math.max(...spells.map(s => s.level), 0)
  
  // Получаем все уровни от 0 до максимального
  const allLevels = Array.from({ length: maxLevel + 1 }, (_, i) => i)
  
  // Получаем все уровни, где есть хотя бы одно заклинание
  const levelsWithSpells = allLevels.filter(level => 
    (preparedStats[level] || 0) > 0 || (alwaysPreparedStats[level] || 0) > 0
  )
  
  // Исключаем заговоры (level === 0) из подсчета
  const totalPrepared = preparedSpellsData.filter(spell => spell.level > 0).length
  const totalAlwaysPrepared = alwaysPreparedSpellsData.filter(spell => spell.level > 0).length
  const total = totalPrepared + totalAlwaysPrepared
  
  return (
    <div className="spell-statistics">
      <h3 className="statistics-title">Статистика</h3>
      <div className="statistics-content">
        {total > 0 ? (
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
              <span className="statistics-label">Подготовлено:</span>
              <span className="statistics-value statistics-prepared">{totalPrepared}</span>
            </div>
            <div className="statistics-row statistics-total statistics-always-prepared-row">
              <span className="statistics-label">Всегда подготовлено:</span>
              <span className="statistics-value statistics-always-prepared">{totalAlwaysPrepared}</span>
            </div>
            <div className="statistics-row statistics-grand-total">
              <span className="statistics-label">Всего заклинаний:</span>
              <span className="statistics-value">{total}</span>
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
