import { useEffect } from 'react'
import SpellDetails from './SpellDetails'

function SpellDetailsModal({
  spell,
  spellState,
  onClose,
  onToggle,
  onAlwaysPrepared,
}) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const isPrepared = spellState > 0
  const isAlwaysPrepared = spellState === 2

  return (
    <div className="spell-modal-backdrop" onClick={onClose}>
      <div
        className="spell-tooltip spell-tooltip--modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spell-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="spell-modal-close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>

        <SpellDetails spell={spell} titleId="spell-modal-title" />

        <div className="spell-modal-actions">
          <button
            type="button"
            className={`spell-modal-action ${isPrepared ? 'is-active' : ''}`}
            onClick={onToggle}
          >
            {isPrepared ? 'Снять подготовку' : 'Подготовить'}
          </button>
          <button
            type="button"
            className={`spell-modal-action spell-modal-action--always ${isAlwaysPrepared ? 'is-active' : ''}`}
            onClick={onAlwaysPrepared}
          >
            {isAlwaysPrepared ? 'Убрать «всегда»' : 'Всегда подготовлено'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SpellDetailsModal
