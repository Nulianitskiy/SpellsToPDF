import { useEffect, useRef, useState } from 'react'

const TOOLTIP_WIDTH = 340
const GAP = 12

function SpellTooltip({ spell, cursorPos, pinned, pinProgress, onMouseLeave }) {
  const tooltipRef = useRef(null)
  const [style, setStyle] = useState({ opacity: 0, pointerEvents: 'none' })
  const [wasJustPinned, setWasJustPinned] = useState(false)

  useEffect(() => {
    if (!tooltipRef.current || !cursorPos) return

    const tooltip = tooltipRef.current.getBoundingClientRect()
    const viewport = { width: window.innerWidth, height: window.innerHeight }

    const spaceRight = viewport.width - cursorPos.x
    const spaceLeft = cursorPos.x

    let left
    if (spaceRight >= TOOLTIP_WIDTH + GAP) {
      left = cursorPos.x + GAP + window.scrollX
    } else if (spaceLeft >= TOOLTIP_WIDTH + GAP) {
      left = cursorPos.x - TOOLTIP_WIDTH - GAP + window.scrollX
    } else {
      left = spaceRight >= spaceLeft
        ? viewport.width - TOOLTIP_WIDTH - 8 + window.scrollX
        : 8 + window.scrollX
    }

    const tooltipHeight = tooltip.height || 400
    let top = cursorPos.y + window.scrollY
    top = Math.max(8 + window.scrollY, Math.min(top, viewport.height - tooltipHeight - 8 + window.scrollY))

    setStyle({
      position: 'absolute',
      top,
      left,
      width: TOOLTIP_WIDTH,
      opacity: 1,
      pointerEvents: pinned ? 'auto' : 'none',
      zIndex: 9999,
    })
  }, [cursorPos, pinned])

  // Анимация закрепления при переходе в pinned
  useEffect(() => {
    if (pinned) {
      setWasJustPinned(true)
      const t = setTimeout(() => setWasJustPinned(false), 600)
      return () => clearTimeout(t)
    }
  }, [pinned])

  const components = spell.components?.join(', ') || '—'
  const material = spell.material ? ` (${spell.material})` : ''
  const higherLevelsLabel = spell.level === 0 ? 'Усиление заговора: ' : 'На высоких уровнях: '

  // Рамка плавно светлеет по мере прогресса, вспыхивает при закреплении
  const borderAlpha = pinned ? 0.85 : pinProgress != null ? 0.4 + pinProgress * 0.45 : 0.4
  const glowAlpha = pinned ? 0.18 : pinProgress != null ? pinProgress * 0.18 : 0
  const borderStyle = {
    borderColor: `rgba(255, 215, 0, ${borderAlpha})`,
    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 215, 0, ${borderAlpha * 0.35}), 0 0 ${Math.round(glowAlpha * 100)}px rgba(255, 215, 0, ${glowAlpha})`,
  }

  const classNames = [
    'spell-tooltip',
    wasJustPinned ? 'spell-tooltip--pin-burst' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classNames}
      ref={tooltipRef}
      style={{ ...style, ...borderStyle }}
      onMouseLeave={pinned ? onMouseLeave : undefined}
    >
      <div className="spell-tooltip-header">
        <div className="spell-tooltip-header-text">
          <span className="spell-tooltip-name">{spell.name}</span>
          {spell.nameEn && (
            <span className="spell-tooltip-name-en">{spell.nameEn}</span>
          )}
        </div>
      </div>

      <div className="spell-tooltip-meta">
        <span className="spell-tooltip-school">{spell.school}</span>
        {spell.ritual && <span className="spell-tooltip-tag">Ритуал</span>}
        {spell.concentration && <span className="spell-tooltip-tag">Концентрация</span>}
      </div>

      <div className="spell-tooltip-stats">
        <div className="spell-tooltip-stat">
          <span className="spell-tooltip-stat-label">Время:</span>
          <span>{spell.casting_time}</span>
        </div>
        <div className="spell-tooltip-stat">
          <span className="spell-tooltip-stat-label">Дистанция:</span>
          <span>{spell.range}</span>
        </div>
        <div className="spell-tooltip-stat">
          <span className="spell-tooltip-stat-label">Компоненты:</span>
          <span>{components}{material}</span>
        </div>
        <div className="spell-tooltip-stat">
          <span className="spell-tooltip-stat-label">Длительность:</span>
          <span>{spell.duration}</span>
        </div>
      </div>

      <div className="spell-tooltip-divider" />

      <p className="spell-tooltip-description">{spell.description}</p>

      {spell.at_higher_levels && (
        <div className="spell-tooltip-higher">
          <span className="spell-tooltip-higher-label">{higherLevelsLabel}</span>
          {spell.at_higher_levels}
        </div>
      )}
    </div>
  )
}

export default SpellTooltip
