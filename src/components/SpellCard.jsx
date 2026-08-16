import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import SpellTooltip from './SpellTooltip'
import SpellIcon from './SpellIcon'

const SHOW_DELAY = 300
const PIN_DELAY = 1500
const HIDE_GRACE_MS = 120

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
  const tooltipRef = useRef(null)
  const showTimerRef = useRef(null)
  const pinTimerRef = useRef(null)
  const hideTimerRef = useRef(null)
  const progressRafRef = useRef(null)
  const pinStartRef = useRef(null)
  const cursorPosRef = useRef(null)
  const lastPointerRef = useRef(null)
  const isPinnedRef = useRef(isPinned)
  const onPinRef = useRef(onPin)

  isPinnedRef.current = isPinned
  onPinRef.current = onPin

  const clearTimers = useCallback(() => {
    clearTimeout(showTimerRef.current)
    clearTimeout(pinTimerRef.current)
    clearTimeout(hideTimerRef.current)
    showTimerRef.current = null
    pinTimerRef.current = null
    hideTimerRef.current = null
    cancelAnimationFrame(progressRafRef.current)
  }, [])

  const stopPinProgress = useCallback(() => {
    cancelAnimationFrame(progressRafRef.current)
    setPinProgress(null)
    pinStartRef.current = null
  }, [])

  const isPointerOverCardOrTooltip = useCallback(() => {
    const pos = lastPointerRef.current
    if (!pos) return false
    const el = document.elementFromPoint(pos.x, pos.y)
    if (!el) return false
    return Boolean(cardRef.current?.contains(el) || tooltipRef.current?.contains(el))
  }, [])

  const dismiss = useCallback(() => {
    clearTimers()
    stopPinProgress()
    setVisible(false)
    setCursorPos(null)
    if (isPinnedRef.current) onPinRef.current(null)
  }, [clearTimers, stopPinProgress])

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) return
    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null
      if (isPointerOverCardOrTooltip()) return
      dismiss()
    }, HIDE_GRACE_MS)
  }, [dismiss, isPointerOverCardOrTooltip])

  // Если другая карточка стала закреплённой — сбрасываем своё состояние
  useEffect(() => {
    if (pinnedSpellId !== null && pinnedSpellId !== spell.id) {
      clearTimers()
      stopPinProgress()
      setVisible(false)
      setCursorPos(null)
    }
  }, [pinnedSpellId, spell.id, clearTimers, stopPinProgress])

  useEffect(() => () => {
    clearTimers()
  }, [clearTimers])

  const showTooltip = visible || isPinned

  // Страховка: скролл, уход курсора и смена окна, если mouseleave не пришёл
  useEffect(() => {
    if (!showTooltip) return

    const onPointerMove = (e) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY }
      if (isPointerOverCardOrTooltip()) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
        return
      }
      scheduleHide()
    }

    const onScrollOrBlur = () => {
      if (!isPointerOverCardOrTooltip()) dismiss()
    }

    document.addEventListener('pointermove', onPointerMove)
    window.addEventListener('scroll', onScrollOrBlur, true)
    window.addEventListener('blur', onScrollOrBlur)

    return () => {
      document.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScrollOrBlur, true)
      window.removeEventListener('blur', onScrollOrBlur)
    }
  }, [showTooltip, dismiss, scheduleHide, isPointerOverCardOrTooltip])

  const startPinProgress = useCallback(() => {
    cancelAnimationFrame(progressRafRef.current)
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

    lastPointerRef.current = { x: e.clientX, y: e.clientY }
    cursorPosRef.current = lastPointerRef.current
    clearTimeout(hideTimerRef.current)
    hideTimerRef.current = null

    if (isPinned) return

    clearTimeout(showTimerRef.current)
    clearTimeout(pinTimerRef.current)

    showTimerRef.current = setTimeout(() => {
      if (!isPointerOverCardOrTooltip()) {
        dismiss()
        return
      }

      setCursorPos({ ...cursorPosRef.current })
      setVisible(true)
      startPinProgress()

      pinTimerRef.current = setTimeout(() => {
        if (!isPointerOverCardOrTooltip()) {
          dismiss()
          return
        }
        onPin(spell.id)
        stopPinProgress()
      }, PIN_DELAY)
    }, SHOW_DELAY)
  }, [isPinned, pinnedSpellId, spell.id, onPin, startPinProgress, stopPinProgress, dismiss, isPointerOverCardOrTooltip])

  const handleMouseMove = useCallback((e) => {
    lastPointerRef.current = { x: e.clientX, y: e.clientY }
    cursorPosRef.current = lastPointerRef.current
  }, [])

  const handleMouseLeave = useCallback((e) => {
    if (tooltipRef.current?.contains(e.relatedTarget)) return
    if (isPinned) {
      scheduleHide()
      return
    }
    dismiss()
  }, [isPinned, scheduleHide, dismiss])

  const handleTooltipMouseEnter = useCallback(() => {
    clearTimeout(hideTimerRef.current)
    hideTimerRef.current = null
  }, [])

  const handleTooltipMouseLeave = useCallback((e) => {
    if (cardRef.current?.contains(e.relatedTarget)) return
    scheduleHide()
  }, [scheduleHide])

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
          <div className="spell-info-main">
            <span className="spell-name">{spell.name}</span>
            <div className="spell-compact-badges">
              <SpellIcon type="school" school={spell.school} title={spell.school} />
              {spell.concentration && (
                <SpellIcon type="concentration" title="Концентрация" />
              )}
              {spell.ritual && (
                <SpellIcon type="ritual" title="Ритуал" />
              )}
            </div>
          </div>
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
          ref={tooltipRef}
          spell={spell}
          cursorPos={cursorPos}
          pinned={isPinned}
          pinProgress={pinProgress}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        />,
        document.body
      )}
    </div>
  )
}

export default SpellCard
