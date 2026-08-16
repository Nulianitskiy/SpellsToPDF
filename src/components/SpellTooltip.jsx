import { forwardRef, useEffect, useRef, useState } from 'react'
import SpellDetails from './SpellDetails'

const TOOLTIP_WIDTH = 340
const GAP = 12

const SpellTooltip = forwardRef(function SpellTooltip({
  spell,
  cursorPos,
  pinned,
  pinProgress,
  onMouseEnter,
  onMouseLeave,
}, ref) {
  const localRef = useRef(null)
  const [style, setStyle] = useState({ opacity: 0, pointerEvents: 'none' })
  const [wasJustPinned, setWasJustPinned] = useState(false)

  const setRefs = (node) => {
    localRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  useEffect(() => {
    if (!localRef.current || !cursorPos) return

    const tooltip = localRef.current.getBoundingClientRect()
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
      ref={setRefs}
      style={{ ...style, ...borderStyle }}
      onMouseEnter={pinned ? onMouseEnter : undefined}
      onMouseLeave={pinned ? onMouseLeave : undefined}
    >
      <SpellDetails spell={spell} />
    </div>
  )
})

export default SpellTooltip
