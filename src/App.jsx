import { useState, useMemo, useEffect, useRef } from 'react'
import spells2024 from './data/spellsRu2024.json'
import spells2014 from './data/spellsRu2014.json'
import SpellFilters from './components/SpellFilters'
import SpellList from './components/SpellList'
import SpellStatistics from './components/SpellStatistics'
import ScrollToTopButton from './components/ScrollToTopButton'
import { generatePDF } from './utils/pdfGenerator'
import { loadPreparedByVersion, savePreparedByVersion } from './utils/preparedSpellsStorage'
import { getSchoolKey, isDunamancy, isUpcastable, spellMatchesQuery } from './utils/spellIcons'
import { buildShareSearch, mapFromShareIds, parseShareUrl } from './utils/shareUrl'
import './App.css'

const SPELLS_BY_VERSION = {
  '2014': spells2014,
  '2024': spells2024,
}

const VALID_SPELL_IDS = {
  '2014': new Set(spells2014.map(spell => spell.id)),
  '2024': new Set(spells2024.map(spell => spell.id)),
}

const initialShare = parseShareUrl(window.location.search)

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
  const [selectedClass, setSelectedClass] = useState(initialShare.selectedClass)
  const [maxLevel, setMaxLevel] = useState(9)
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState(null)
  const [schoolFilter, setSchoolFilter] = useState('')
  const [onlyRitual, setOnlyRitual] = useState(false)
  const [onlyConcentration, setOnlyConcentration] = useState(false)
  const [onlyUpcast, setOnlyUpcast] = useState(false)
  const [onlyDunamancy, setOnlyDunamancy] = useState(false)
  const [onlyPrepared, setOnlyPrepared] = useState(false)
  const [pdfFormat, setPdfFormat] = useState('list') // 'list' or 'cards'
  const [spellVersion, setSpellVersion] = useState(initialShare.version || '2024')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const pdfUrlRef = useRef(null)
  // Map: spellId -> state (1 = подготовлено, 2 = всегда подготовлено), отдельно для каждой версии
  const [preparedByVersion, setPreparedByVersion] = useState(() => {
    const store = loadPreparedByVersion(VALID_SPELL_IDS)
    if (initialShare.hasSpellList) {
      const version = initialShare.version || '2024'
      store[version] = mapFromShareIds(
        initialShare.preparedIds,
        initialShare.alwaysIds,
        VALID_SPELL_IDS[version]
      )
    }
    return store
  })

  const preparedSpells = useMemo(
    () => preparedByVersion[spellVersion] || new Map(),
    [preparedByVersion, spellVersion]
  )

  useEffect(() => {
    savePreparedByVersion(preparedByVersion)
  }, [preparedByVersion])

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
    }
  }, [])

  // Выбираем данные на основе версии
  const spells = useMemo(() => {
    return SPELLS_BY_VERSION[spellVersion]
  }, [spellVersion])

  // Вычисляем классы и максимальный уровень на основе выбранной версии
  const allClasses = useMemo(() => {
    return [...new Set(spells.flatMap(spell => spell.classes))].sort()
  }, [spells])

  const maxSpellLevel = useMemo(() => {
    return Math.max(...spells.map(spell => spell.level))
  }, [spells])

  const availableSpells = useMemo(() => {
    return spells.filter(spell => {
      if (selectedClass && !spell.classes.includes(selectedClass)) return false
      if (spell.level > maxLevel) return false
      return true
    })
  }, [spells, selectedClass, maxLevel])

  const allSchools = useMemo(() => {
    return [...new Set(availableSpells.map(spell => getSchoolKey(spell.school)).filter(Boolean))].sort()
  }, [availableSpells])

  const hasDunamancy = useMemo(() => {
    return availableSpells.some(isDunamancy)
  }, [availableSpells])

  useEffect(() => {
    if (schoolFilter && !allSchools.includes(schoolFilter)) {
      setSchoolFilter('')
    }
  }, [allSchools, schoolFilter])

  useEffect(() => {
    if (!hasDunamancy) {
      setOnlyDunamancy(false)
    }
  }, [hasDunamancy])

  useEffect(() => {
    if (selectedClass && !allClasses.includes(selectedClass)) {
      setSelectedClass('')
    }
  }, [allClasses, selectedClass])

  useEffect(() => {
    const search = buildShareSearch({
      version: spellVersion,
      selectedClass,
      preparedMap: preparedSpells,
    })
    const next = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (next !== current) {
      window.history.replaceState(null, '', next)
    }
  }, [spellVersion, selectedClass, preparedSpells])

  const filteredSpells = useMemo(() => {
    return availableSpells.filter(spell => {
      if (levelFilter !== null && spell.level !== levelFilter) return false
      if (!spellMatchesQuery(spell, searchQuery)) return false
      if (schoolFilter && getSchoolKey(spell.school) !== schoolFilter) return false
      if (onlyRitual && !spell.ritual) return false
      if (onlyConcentration && !spell.concentration) return false
      if (onlyUpcast && !isUpcastable(spell)) return false
      if (onlyDunamancy && !isDunamancy(spell)) return false
      if (onlyPrepared) {
        const state = preparedSpells.get(spell.id)
        if (state !== 1 && state !== 2) return false
      }
      return true
    })
  }, [
    availableSpells,
    levelFilter,
    searchQuery,
    schoolFilter,
    onlyRitual,
    onlyConcentration,
    onlyUpcast,
    onlyDunamancy,
    onlyPrepared,
    preparedSpells,
  ])

  const updatePreparedSpells = (updater) => {
    setPreparedByVersion(prev => {
      const current = prev[spellVersion] || new Map()
      return {
        ...prev,
        [spellVersion]: updater(current),
      }
    })
  }

  const cycleSpell = (spellId) => {
    updatePreparedSpells(prev => {
      const next = new Map(prev)
      const currentState = next.get(spellId) || 0
      if (currentState === 0) {
        next.set(spellId, 1)
      } else if (currentState === 1) {
        next.set(spellId, 2)
      } else {
        next.delete(spellId)
      }
      return next
    })
  }

  const toggleSpell = (spellId) => {
    updatePreparedSpells(prev => {
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
    updatePreparedSpells(prev => {
      const next = new Map(prev)
      const currentState = next.get(spellId) || 0
      // Звезда: включает «всегда подготовлено» или снимает его
      if (currentState === 2) {
        next.delete(spellId)
      } else {
        next.set(spellId, 2)
      }
      return next
    })
  }

  const handleGeneratePDF = async () => {
    // Включаем заклинания в состоянии 1 (подготовлено) и 2 (всегда подготовлено)
    const selectedSpellsData = spells.filter(spell => {
      const state = preparedSpells.get(spell.id)
      return state === 1 || state === 2
    })
    if (selectedSpellsData.length === 0) {
      alert('Выберите хотя бы одно заклинание')
      return
    }

    // Открываем вкладку сразу, чтобы браузер не заблокировал popup после await
    const previewTab = window.open('', '_blank')
    if (previewTab) {
      previewTab.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Создание PDF…</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #060608;
        color: #ffd700;
        font-family: Georgia, serif;
        font-size: 18px;
      }
    </style>
  </head>
  <body>Создание PDF…</body>
</html>`)
      previewTab.document.close()
    }

    setPdfLoading(true)

    try {
      const { url } = await generatePDF(selectedSpellsData, pdfFormat, preparedSpells, {
        selectedClass,
        version: spellVersion,
      })
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
      pdfUrlRef.current = url
      if (previewTab && !previewTab.closed) {
        previewTab.location.replace(url)
        previewTab.focus()
      } else if (!window.open(url, '_blank')) {
        alert('Разрешите всплывающие окна, чтобы открыть PDF')
      }
    } catch (error) {
      console.error(error)
      if (previewTab && !previewTab.closed) {
        previewTab.close()
      }
      alert('Не удалось создать PDF. Попробуйте ещё раз.')
    } finally {
      setPdfLoading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setLinkCopied(true)
      window.setTimeout(() => setLinkCopied(false), 1600)
    } catch {
      alert('Не удалось скопировать ссылку')
    }
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
        allSchools={allSchools}
        maxSpellLevel={maxSpellLevel}
        spellVersion={spellVersion}
        setSpellVersion={setSpellVersion}
        schoolFilter={schoolFilter}
        setSchoolFilter={setSchoolFilter}
        onlyRitual={onlyRitual}
        setOnlyRitual={setOnlyRitual}
        onlyConcentration={onlyConcentration}
        setOnlyConcentration={setOnlyConcentration}
        onlyUpcast={onlyUpcast}
        setOnlyUpcast={setOnlyUpcast}
        onlyDunamancy={onlyDunamancy}
        setOnlyDunamancy={setOnlyDunamancy}
        onlyPrepared={onlyPrepared}
        setOnlyPrepared={setOnlyPrepared}
        hasDunamancy={hasDunamancy}
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
            disabled={preparedCount === 0 || pdfLoading}
          >
            {pdfLoading ? 'Создание…' : 'Создать PDF'}
          </button>
          <button
            type="button"
            className="copy-link-btn"
            onClick={handleCopyLink}
          >
            {linkCopied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
          </button>
        </div>
      </div>

      <div className="hint-box">
        <div className="hint-icon">💡</div>
        <div className="hint-text">
          <strong>Подсказки</strong>
          <ul className="hint-list">
            <li>Звезда: подготовить → всегда подготовлено → снять</li>
            <li>На компьютере: наведение или I — описание. Tab, Enter и стрелки для навигации</li>
            <li>На телефоне: нажатие на название открывает описание</li>
            <li>Ссылку из адресной строки можно отправить — в ней версия, класс и выбранные заклинания</li>
          </ul>
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
          cycleSpell={cycleSpell}
          toggleSpell={toggleSpell}
          toggleAlwaysPrepared={toggleAlwaysPrepared}
        />
      </div>
      
      <ScrollToTopButton />
    </div>
  )
}

export default App
