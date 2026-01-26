import { useState, useMemo, useEffect } from 'react'
import spells2024 from './data/spellsRu2024.json'
import spells2014 from './data/spellsRu2014.json'
import SpellFilters from './components/SpellFilters'
import SpellList from './components/SpellList'
import SpellStatistics from './components/SpellStatistics'
import ScrollToTopButton from './components/ScrollToTopButton'
import { generatePDF } from './utils/pdfGenerator'
import './App.css'

// Склонение слова "заклинание"
function pluralizeSpells(count) {
  const lastTwo = count % 100
  const lastOne = count % 10
  
  if (lastTwo >= 11 && lastTwo <= 19) {
    return 'заклинаний'
  }
  if (lastOne === 1) {
    return 'заклинание'
  }
  if (lastOne >= 2 && lastOne <= 4) {
    return 'заклинания'
  }
  return 'заклинаний'
}

function App() {
  const [selectedClass, setSelectedClass] = useState('')
  const [maxLevel, setMaxLevel] = useState(9)
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState(null)
  // Map: spellId -> state (0 = не подготовлено, 1 = подготовлено, 2 = всегда подготовлено)
  const [preparedSpells, setPreparedSpells] = useState(new Map())
  const [pdfFormat, setPdfFormat] = useState('list') // 'list' or 'cards'
  const [spellVersion, setSpellVersion] = useState('2024') // '2024' or '2014'

  // Выбираем данные на основе версии
  const spells = useMemo(() => {
    return spellVersion === '2014' ? spells2014 : spells2024
  }, [spellVersion])

  // Вычисляем классы и максимальный уровень на основе выбранной версии
  const allClasses = useMemo(() => {
    return [...new Set(spells.flatMap(spell => spell.classes))].sort()
  }, [spells])

  const maxSpellLevel = useMemo(() => {
    return Math.max(...spells.map(spell => spell.level))
  }, [spells])

  // Сбрасываем выбранные заклинания при переключении версии
  useEffect(() => {
    setPreparedSpells(new Map())
  }, [spellVersion])

  const availableSpells = useMemo(() => {
    return spells.filter(spell => {
      if (selectedClass && !spell.classes.includes(selectedClass)) return false
      if (spell.level > maxLevel) return false
      return true
    })
  }, [spells, selectedClass, maxLevel])

  const filteredSpells = useMemo(() => {
    return availableSpells.filter(spell => {
      if (levelFilter !== null && spell.level !== levelFilter) return false
      if (searchQuery && !spell.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [availableSpells, levelFilter, searchQuery])

  const toggleSpell = (spellId) => {
    setPreparedSpells(prev => {
      const next = new Map(prev)
      const currentState = next.get(spellId) || 0
      // Одно нажатие: 0 -> 1, 1 -> 0
      if (currentState === 0) {
        next.set(spellId, 1)
      } else if (currentState === 1) {
        next.delete(spellId)
      } else if (currentState === 2) {
        next.delete(spellId)
      }
      return next
    })
  }

  const toggleAlwaysPrepared = (spellId) => {
    setPreparedSpells(prev => {
      const next = new Map(prev)
      const currentState = next.get(spellId) || 0
      // Двойное нажатие: переключает в состояние "всегда подготовлено" или обратно
      if (currentState === 2) {
        next.delete(spellId)
      } else {
        next.set(spellId, 2)
      }
      return next
    })
  }

  const handleGeneratePDF = () => {
    // Включаем заклинания в состоянии 1 (подготовлено) и 2 (всегда подготовлено)
    const selectedSpellsData = spells.filter(spell => {
      const state = preparedSpells.get(spell.id)
      return state === 1 || state === 2
    })
    if (selectedSpellsData.length === 0) {
      alert('Выберите хотя бы одно заклинание')
      return
    }
    generatePDF(selectedSpellsData, pdfFormat)
  }

  // Считаем все выбранные заклинания (состояния 1 и 2)
  const preparedCount = Array.from(preparedSpells.values()).filter(state => state === 1 || state === 2).length

  return (
    <div className="app">
      <header className="header">
        <h1>Подготовка заклинаний D&D</h1>
        <p className="subtitle">Выберите заклинания и сгенерируйте PDF</p>
      </header>

      <SpellFilters
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        maxLevel={maxLevel}
        setMaxLevel={setMaxLevel}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        levelFilter={levelFilter}
        setLevelFilter={setLevelFilter}
        allClasses={allClasses}
        maxSpellLevel={maxSpellLevel}
        spellVersion={spellVersion}
        setSpellVersion={setSpellVersion}
      />

      <div className="actions">
        <span className="prepared-count">
          Подготовлено: {preparedCount} {pluralizeSpells(preparedCount)}
        </span>
        <div className="pdf-controls">
          <div className="format-selector">
            <label className="format-label">Формат PDF:</label>
            <div className="format-options">
              <label className="format-option">
                <input
                  type="radio"
                  name="pdfFormat"
                  value="list"
                  checked={pdfFormat === 'list'}
                  onChange={(e) => setPdfFormat(e.target.value)}
                />
                <span>Список</span>
              </label>
              <label className="format-option">
                <input
                  type="radio"
                  name="pdfFormat"
                  value="cards"
                  checked={pdfFormat === 'cards'}
                  onChange={(e) => setPdfFormat(e.target.value)}
                />
                <span>Карточки</span>
              </label>
            </div>
          </div>
          <button 
            className="generate-btn" 
            onClick={handleGeneratePDF}
            disabled={preparedCount === 0}
          >
            Создать PDF
          </button>
        </div>
      </div>

      <div className="hint-box">
        <div className="hint-icon">💡</div>
        <div className="hint-text">
          <strong>Подсказка:</strong> При нажатии на заклинание оно становится подготовленным. 
          Двойное нажатие делает его всегда подготовленным.
        </div>
      </div>

      <div className="main-content">
        <SpellStatistics
          preparedSpells={preparedSpells}
          spells={spells}
        />
        <SpellList
          spells={filteredSpells}
          preparedSpells={preparedSpells}
          toggleSpell={toggleSpell}
          toggleAlwaysPrepared={toggleAlwaysPrepared}
        />
      </div>
      
      <ScrollToTopButton />
    </div>
  )
}

export default App
