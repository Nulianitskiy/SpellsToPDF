import { getIconSvg, getIconTitle } from '../utils/spellIcons'

function SpellIcon({ type, school, title, className = '' }) {
  const svg = getIconSvg(type, school)
  if (!svg) return null

  const label = title || getIconTitle(type, school)

  return (
    <span
      className={`spell-icon ${className}`.trim()}
      title={label}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default SpellIcon
