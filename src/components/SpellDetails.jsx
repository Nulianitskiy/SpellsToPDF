import SpellIcon from './SpellIcon'
import { formatComponents, isUpcastable } from '../utils/spellIcons'

function SpellDetails({ spell, titleId }) {
  const components = formatComponents(spell)
  const higherLevelsLabel = spell.level === 0 ? 'Усиление заговора: ' : 'На высоких уровнях: '

  return (
    <>
      <div className="spell-tooltip-header">
        <div className="spell-tooltip-header-text">
          <span className="spell-tooltip-name" id={titleId}>{spell.name}</span>
          {spell.nameEn && (
            <span className="spell-tooltip-name-en">{spell.nameEn}</span>
          )}
        </div>
      </div>

      <div className="spell-tooltip-meta">
        <span className="spell-tooltip-school">
          <SpellIcon type="school" school={spell.school} title={spell.school} />
          {spell.school}
        </span>
        {spell.ritual && (
          <span className="spell-tooltip-tag">
            <SpellIcon type="ritual" title="Ритуал" />
            Ритуал
          </span>
        )}
        {spell.concentration && (
          <span className="spell-tooltip-tag">
            <SpellIcon type="concentration" title="Концентрация" />
            Концентрация
          </span>
        )}
        {isUpcastable(spell) && (
          <span className="spell-tooltip-tag spell-tooltip-tag--upcast">
            <SpellIcon type="upcast" title="Повышаемое" />
            Повышаемое
          </span>
        )}
      </div>

      <div className="spell-tooltip-stats">
        <div className="spell-tooltip-stat">
          <span className="spell-tooltip-stat-label">
            <SpellIcon type="casting" title="Время накладывания" />
            Время
          </span>
          <span>{spell.casting_time}</span>
        </div>
        <div className="spell-tooltip-stat">
          <span className="spell-tooltip-stat-label">
            <SpellIcon type="range" title="Дистанция" />
            Дистанция
          </span>
          <span>{spell.range}</span>
        </div>
        <div className="spell-tooltip-stat">
          <span className="spell-tooltip-stat-label">
            <SpellIcon type="components" title="Компоненты" />
            Компоненты
          </span>
          <span>{components}</span>
        </div>
        <div className="spell-tooltip-stat">
          <span className="spell-tooltip-stat-label">
            <SpellIcon type="duration" title="Длительность" />
            Длительность
          </span>
          <span>{spell.duration}</span>
        </div>
      </div>

      <div className="spell-tooltip-divider" />

      <p className="spell-tooltip-description">{spell.description}</p>

      {spell.at_higher_levels && (
        <div className="spell-tooltip-higher">
          <span className="spell-tooltip-higher-label">
            <SpellIcon type="upcast" title="Повышаемое" />
            {higherLevelsLabel}
          </span>
          {spell.at_higher_levels}
        </div>
      )}
    </>
  )
}

export default SpellDetails
