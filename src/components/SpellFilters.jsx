import SpellIcon from './SpellIcon'

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
  allSchools,
  maxSpellLevel,
  spellVersion,
  setSpellVersion,
  schoolFilter,
  setSchoolFilter,
  onlyRitual,
  setOnlyRitual,
  onlyConcentration,
  setOnlyConcentration,
  onlyUpcast,
  setOnlyUpcast,
  onlyDunamancy,
  setOnlyDunamancy,
  onlyPrepared,
  setOnlyPrepared,
  hasDunamancy,
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
          <label>Школа</label>
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
          >
            <option value="">Все школы</option>
            {allSchools.map(school => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Поиск</label>
          <input
            type="search"
            placeholder="Русское или английское название..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-flags">
        <button
          type="button"
          className={`flag-btn ${onlyRitual ? 'active' : ''}`}
          onClick={() => setOnlyRitual(value => !value)}
        >
          <SpellIcon type="ritual" title="Ритуал" />
          Ритуал
        </button>
        <button
          type="button"
          className={`flag-btn ${onlyConcentration ? 'active' : ''}`}
          onClick={() => setOnlyConcentration(value => !value)}
        >
          <SpellIcon type="concentration" title="Концентрация" />
          Концентрация
        </button>
        <button
          type="button"
          className={`flag-btn ${onlyUpcast ? 'active' : ''}`}
          onClick={() => setOnlyUpcast(value => !value)}
        >
          <SpellIcon type="upcast" title="Повышаемое" />
          Повышаемое
        </button>
        {hasDunamancy && (
          <button
            type="button"
            className={`flag-btn ${onlyDunamancy ? 'active' : ''}`}
            onClick={() => setOnlyDunamancy(value => !value)}
          >
            Дюнамантия
          </button>
        )}
        <button
          type="button"
          className={`flag-btn ${onlyPrepared ? 'active' : ''}`}
          onClick={() => setOnlyPrepared(value => !value)}
        >
          Только выбранные
        </button>
      </div>

      <div className="level-filters-wrapper">
        <div className="level-filters">
          <button
            type="button"
            className={`level-btn ${levelFilter === null ? 'active' : ''}`}
            onClick={() => setLevelFilter(null)}
          >
            Все
          </button>
          {levels.map(level => (
            <button
              type="button"
              key={level}
              className={`level-btn ${levelFilter === level ? 'active' : ''}`}
              onClick={() => setLevelFilter(level)}
            >
              {level === 0 ? 'Заговор' : level}
            </button>
          ))}
        </div>
        <div className="version-selector">
          <label className="version-label">Версия:</label>
          <div className="version-options">
            <label className="version-option">
              <input
                type="radio"
                name="spellVersion"
                value="2024"
                checked={spellVersion === '2024'}
                onChange={(e) => setSpellVersion(e.target.value)}
              />
              <span>2024</span>
            </label>
            <label className="version-option">
              <input
                type="radio"
                name="spellVersion"
                value="2014"
                checked={spellVersion === '2014'}
                onChange={(e) => setSpellVersion(e.target.value)}
              />
              <span>2014</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpellFilters
