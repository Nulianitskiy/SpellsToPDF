import { useState, useMemo } from 'react'
import spells from './data/spellsRu2024.json'
import SpellFilters from './components/SpellFilters'
import SpellList from './components/SpellList'
import { generatePDF } from './utils/pdfGenerator'
import './App.css'

const ALL_CLASSES = [...new Set(spells.flatMap(spell => spell.classes))].sort()
const MAX_SPELL_LEVEL = Math.max(...spells.map(spell => spell.level))

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
  const [preparedSpells, setPreparedSpells] = useState(new Set())

  const availableSpells = useMemo(() => {
    return spells.filter(spell => {
      if (selectedClass && !spell.classes.includes(selectedClass)) return false
      if (spell.level > maxLevel) return false
      return true
    })
  }, [selectedClass, maxLevel])

  const filteredSpells = useMemo(() => {
    return availableSpells.filter(spell => {
      if (levelFilter !== null && spell.level !== levelFilter) return false
      if (searchQuery && !spell.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [availableSpells, levelFilter, searchQuery])

  const toggleSpell = (spellId) => {
    setPreparedSpells(prev => {
      const next = new Set(prev)
      if (next.has(spellId)) {
        next.delete(spellId)
      } else {
        next.add(spellId)
      }
      return next
    })
  }

  const handleGeneratePDF = () => {
    const selectedSpellsData = spells.filter(spell => preparedSpells.has(spell.id))
    if (selectedSpellsData.length === 0) {
      alert('Выберите хотя бы одно заклинание')
      return
    }
    generatePDF(selectedSpellsData)
  }

  const preparedCount = preparedSpells.size

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
        allClasses={ALL_CLASSES}
        maxSpellLevel={MAX_SPELL_LEVEL}
      />

      <div className="actions">
        <span className="prepared-count">
          Подготовлено: {preparedCount} {pluralizeSpells(preparedCount)}
        </span>
        <button 
          className="generate-btn" 
          onClick={handleGeneratePDF}
          disabled={preparedCount === 0}
        >
          Создать PDF
        </button>
      </div>

      <SpellList
        spells={filteredSpells}
        preparedSpells={preparedSpells}
        toggleSpell={toggleSpell}
      />
    </div>
  )
}

export default App
