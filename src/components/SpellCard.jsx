import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import SpellTooltip from './SpellTooltip'
import SpellIcon from './SpellIcon'

const SHOW_DELAY = 300
const PIN_DELAY = 1500
const HIDE_GRACE_MS = 120

function SpellCard({
  spell,
  spellState,
  onCycle,
  onOpenDetails,
  hoverEnabled,
  pinnedSpellId,
  onPin,
  onNavigate,
}) {
  const levelText = spell.level === 0 ? 'Заговор' : `${spell.level} уровень`

  // spellState: 0 = не подготовлено, 1 = подготовлено, 2 = всегда подготовлено
  const stateClass = spellState === 1 ? 'prepared' : spellState === 2 ? 'always-prepared' : ''
  const starTitle = spellState === 0
    ? 'Подготовить'
    : spellState === 1
      ? 'Всегда подготовлено'
      : 'Снять подготовку'

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

  useEffect(() => {
    isPinnedRef.current = isPinned
    onPinRef.current = onPin
  }, [isPinned, onPin])

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

  const blockedByOtherPin = pinnedSpellId !== null && pinnedSpellId !== spell.id

  useEffect(() => {
    if (!blockedByOtherPin) return
    clearTimeout(showTimerRef.current)
    clearTimeout(pinTimerRef.current)
    clearTimeout(hideTimerRef.current)
    showTimerRef.current = null
    pinTimerRef.current = null
    hideTimerRef.current = null
    cancelAnimationFrame(progressRafRef.current)
    pinStartRef.current = null
  }, [blockedByOtherPin])

  useEffect(() => () => {
    clearTimers()
  }, [clearTimers])

  const showTooltip = hoverEnabled && !blockedByOtherPin && (visible || isPinned)

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
    if (!hoverEnabled) return
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
  }, [hoverEnabled, isPinned, pinnedSpellId, spell.id, onPin, startPinProgress, stopPinProgress, dismiss, isPointerOverCardOrTooltip])

  const handleMouseMove = useCallback((e) => {
    lastPointerRef.current = { x: e.clientX, y: e.clientY }
    cursorPosRef.current = lastPointerRef.current
  }, [])

  const handleMouseLeave = useCallback((e) => {
    if (!hoverEnabled) return
    if (tooltipRef.current?.contains(e.relatedTarget)) return
    if (isPinned) {
      scheduleHide()
      return
    }
    dismiss()
  }, [hoverEnabled, isPinned, scheduleHide, dismiss])

  const handleTooltipMouseEnter = useCallback(() => {
    clearTimeout(hideTimerRef.current)
    hideTimerRef.current = null
  }, [])

  const handleTooltipMouseLeave = useCallback((e) => {
    if (cardRef.current?.contains(e.relatedTarget)) return
    scheduleHide()
  }, [scheduleHide])

  const getAnchorPos = useCallback(() => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return { x: 16, y: 16 }
    return {
      x: Math.min(rect.right - 8, window.innerWidth - 16),
      y: Math.max(8, rect.top + 8),
    }
  }, [])

  const pinFromCard = useCallback(() => {
    const pos = getAnchorPos()
    lastPointerRef.current = pos
    cursorPosRef.current = pos
    setCursorPos(pos)
    setVisible(true)
    onPin(spell.id)
    stopPinProgress()
  }, [getAnchorPos, onPin, spell.id, stopPinProgress])

  const handleInfoClick = (event) => {
    event.preventDefault()
    if (onOpenDetails) {
      onOpenDetails()
      return
    }
    if (isPinned) {
      dismiss()
      return
    }
    pinFromCard()
  }

  const handleCardKeyDown = (event) => {
    if (
      event.key === 'ArrowRight'
      || event.key === 'ArrowDown'
      || event.key === 'ArrowLeft'
      || event.key === 'ArrowUp'
    ) {
      onNavigate?.(event)
      return
    }

    if (event.target !== cardRef.current) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onCycle()
      return
    }

    if (event.key === 'i' || event.key === 'I') {
      event.preventDefault()
      if (onOpenDetails) onOpenDetails()
      else if (isPinned) dismiss()
      else pinFromCard()
    }
  }

  return (
    <div
      ref={cardRef}
      className={`spell-card ${stateClass}`}
      tabIndex={0}
      role="group"
      aria-label={`${spell.name}, ${levelText}${spellState === 1 ? ', подготовлено' : spellState === 2 ? ', всегда подготовлено' : ''}`}
      onKeyDown={handleCardKeyDown}
      onMouseEnter={hoverEnabled ? handleMouseEnter : undefined}
      onMouseMove={hoverEnabled ? handleMouseMove : undefined}
      onMouseLeave={hoverEnabled ? handleMouseLeave : undefined}
    >
      <div className="spell-card-header">
        <button
          type="button"
          className={`spell-star-btn ${spellState === 1 ? 'is-prepared' : ''} ${spellState === 2 ? 'is-always' : ''}`}
          title={starTitle}
          aria-label={starTitle}
          aria-pressed={spellState > 0}
          tabIndex={-1}
          onClick={onCycle}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2.5l2.7 6.6 7.2.6-5.5 4.6 1.7 7-6.1-3.7-6.1 3.7 1.7-7-5.5-4.6 7.2-.6z"
            />
          </svg>
        </button>

        <button
          type="button"
          className="spell-info"
          tabIndex={-1}
          onClick={handleInfoClick}
          title={onOpenDetails ? 'Открыть описание' : 'Показать описание'}
        >
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
              {onOpenDetails && (
                <span className="spell-open-hint" aria-hidden="true">i</span>
              )}
            </div>
          </div>
          <span className="spell-level">{levelText}</span>
        </button>
      </div>

      {!blockedByOtherPin && pinProgress !== null && (
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
