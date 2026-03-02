import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import SpellTooltip from './SpellTooltip'

const SHOW_DELAY = 300
const PIN_DELAY = 1500

function SpellCard({ spell, spellState, onToggle, onDoubleClick, pinnedSpellId, onPin }) {
  const levelText = spell.level === 0 ? 'Заговор' : `${spell.level} уровень`

  // spellState: 0 = не подготовлено, 1 = подготовлено, 2 = всегда подготовлено
  const stateClass = spellState === 1 ? 'prepared' : spellState === 2 ? 'always-prepared' : ''
  const isChecked = spellState > 0

  const isPinned = pinnedSpellId === spell.id
  const [visible, setVisible] = useState(false)
  const [pinProgress, setPinProgress] = useState(null)
  const [cursorPos, setCursorPos] = useState(null)

  const cardRef = useRef(null)
  const showTimerRef = useRef(null)
  const pinTimerRef = useRef(null)
  const progressRafRef = useRef(null)
  const pinStartRef = useRef(null)
  const cursorPosRef = useRef(null)

  // Если другая карточка стала закреплённой — сбрасываем своё состояние
  useEffect(() => {
    if (pinnedSpellId !== null && pinnedSpellId !== spell.id) {
      clearTimeout(showTimerRef.current)
      clearTimeout(pinTimerRef.current)
      cancelAnimationFrame(progressRafRef.current)
      setPinProgress(null)
      setVisible(false)
      setCursorPos(null)
    }
  }, [pinnedSpellId, spell.id])

  const stopPinProgress = useCallback(() => {
    cancelAnimationFrame(progressRafRef.current)
    setPinProgress(null)
    pinStartRef.current = null
  }, [])

  const startPinProgress = useCallback(() => {
    pinStartRef.current = performance.now()

    const tick = (now) => {
      const elapsed = now - pinStartRef.current
      const progress = Math.min(elapsed / PIN_DELAY, 1)
      setPinProgress(progress)
      if (progress < 1) {
        progressRafRef.current = requestAnimationFrame(tick)
      }
    }
    progressRafRef.current = requestAnimationFrame(tick)
  }, [])

  const handleMouseEnter = useCallback((e) => {
    // Если закреплена другая карточка — не показываем
    if (pinnedSpellId !== null && pinnedSpellId !== spell.id) return
    if (isPinned) return

    cursorPosRef.current = { x: e.clientX, y: e.clientY }

    showTimerRef.current = setTimeout(() => {
      setCursorPos({ ...cursorPosRef.current })
      setVisible(true)
      startPinProgress()

      pinTimerRef.current = setTimeout(() => {
        onPin(spell.id)
        stopPinProgress()
      }, PIN_DELAY)
    }, SHOW_DELAY)
  }, [isPinned, pinnedSpellId, spell.id, onPin, startPinProgress, stopPinProgress])

  const handleMouseMove = useCallback((e) => {
    cursorPosRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (isPinned) return

    clearTimeout(showTimerRef.current)
    clearTimeout(pinTimerRef.current)
    stopPinProgress()
    setVisible(false)
    setCursorPos(null)
  }, [isPinned, stopPinProgress])

  const handleTooltipMouseLeave = useCallback(() => {
    if (!isPinned) return
    onPin(null)
    setVisible(false)
    setCursorPos(null)
  }, [isPinned, onPin])

  const showTooltip = visible || isPinned

  return (
    <div
      ref={cardRef}
      className={`spell-card ${stateClass}`}
      onDoubleClick={onDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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

      {pinProgress !== null && (
        <div className="spell-card-pin-progress">
          <div
            className="spell-card-pin-progress-bar"
            style={{ width: `${pinProgress * 100}%` }}
          />
        </div>
      )}

      {showTooltip && cursorPos && createPortal(
        <SpellTooltip
          spell={spell}
          cursorPos={cursorPos}
          pinned={isPinned}
          pinProgress={pinProgress}
          onMouseLeave={handleTooltipMouseLeave}
        />,
        document.body
      )}
    </div>
  )
}

export default SpellCard
