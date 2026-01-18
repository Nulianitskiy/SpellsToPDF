function SpellFilters({
  selectedClass,
  setSelectedClass,
  maxLevel,
  setMaxLevel,
  searchQuery,
  setSearchQuery,
  levelFilter,
  setLevelFilter,
  allClasses,
  maxSpellLevel
}) {
  const levels = Array.from({ length: maxSpellLevel + 1 }, (_, i) => i)

  return (
    <div className="filters">
      <div className="filter-row">
        <div className="filter-group">
          <label>Класс</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Все классы</option>
            {allClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Макс. уровень</label>
          <select
            value={maxLevel}
            onChange={(e) => setMaxLevel(Number(e.target.value))}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i} value={i}>
                {i === 0 ? 'Только заговоры' : `${i} уровень`}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Поиск</label>
          <input
            type="text"
            placeholder="Найти заклинание..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="level-filters">
        <button
          className={`level-btn ${levelFilter === null ? 'active' : ''}`}
          onClick={() => setLevelFilter(null)}
        >
          Все
        </button>
        {levels.map(level => (
          <button
            key={level}
            className={`level-btn ${levelFilter === level ? 'active' : ''}`}
            onClick={() => setLevelFilter(level)}
          >
            {level === 0 ? 'Заговор' : level}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SpellFilters
